module red_packet::red_packet {
  use std::vector;
  use sui::coin::{Self, Coin};
  use sui::object::{Self, UID, ID};
  use std::option::{Self, Option};
  use sui::tx_context::{Self, TxContext};
  use sui::transfer;
  use sui::bcs::{Self};
  use sui::hash::blake2b256;
  use sui::balance::{Self, Balance};
  use sui::package;
  use std::ascii::String;
  use sui::event;
  use sui::address;
  use std::debug;
  use oracle::weather::{WeatherOracle};
  use std::type_name;
  use sui::clock::{Self, Clock};


  // --------------- Errors ---------------

  // const EInvalidSendAmount: u64 = 0;
  const EAlreadyClaimed: u64 = 1;
  const ENotInSpecifiedRecipients: u64 = 2;

  struct RedPacket<phantom T> has key, store {
      id: UID,
      sender: address,
      amount: u64,
      left_amount: u64,
      coin_type: String,
      coin_amount: Balance<T>,
      original_amount: u64,
      claimer_addresses: vector<address>,
      specified_recipient: Option<vector<address>>
  }

  // --------------- Events ---------------

  struct NewRedPacket<phantom T> has copy, drop {
      red_packet_id: ID,
      sender: address,
      amount: u64,
      coin_type: String,
      coin_amount: u64,
  }

  struct ClaimRedPacket<phantom T> has copy, drop {
    claim_red_packet_id: ID,
    claimer: address,
    claim_amount: u64,
    claim_coin_type: String,
  }


  struct AdminCap has key {
    id: UID,
  }


  // --------------- Witness ---------------

  struct RED_PACKET has drop {}

  // --------------- Constructor ---------------

  fun init(otw: RED_PACKET, ctx: &mut TxContext) {
      let admin = tx_context::sender(ctx);
      let publisher = package::claim(otw, ctx);
      transfer::public_transfer(publisher, admin);
      let admin_cap = AdminCap { id: object::new(ctx) };
      transfer::transfer(admin_cap, admin);
  }

  public entry fun send_new_red_packet<T>(
      amount: u64,
      coin_amount: Coin<T>,
      specified_recipient: Option<vector<address>>,
      ctx: &mut TxContext,
  ) {
    let sender = tx_context::sender(ctx);
    let id = object::new(ctx);
    let red_packet_id = object::uid_to_inner(&id);
    let coin_amount_num = coin::value(&coin_amount);

    let coin_amount = coin::into_balance(coin_amount);

    let coin_type = type_name::get<T>();
    let coin_type_string = *type_name::borrow_string(&coin_type);
    
    event::emit(NewRedPacket<T> {
        red_packet_id,
        sender,
        amount,
        coin_type: coin_type_string,
        coin_amount: coin_amount_num,
    });

    let red_packet = RedPacket<T> {
        id,
        sender,
        amount,
        left_amount:amount,
        coin_type: coin_type_string,
        coin_amount,
        original_amount: coin_amount_num,
        claimer_addresses: vector::empty<address>(),
        specified_recipient,
    };

    transfer::share_object(red_packet);
  }

  public entry fun claim_red_packet<T>(red_packet:&mut RedPacket<T>,weather_oracle: &WeatherOracle, clock: &Clock, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);

    assert!(!vector::contains(&red_packet.claimer_addresses, &sender), EAlreadyClaimed);

    if(!option::is_none(&red_packet.specified_recipient)) {
      let specified = option::borrow(&red_packet.specified_recipient);
      assert!(vector::contains(specified, &sender), ENotInSpecifiedRecipients);
    };

    let left_value = balance::value(&red_packet.coin_amount);
    let coin_type = type_name::get<T>();
    let coin_type_string = *type_name::borrow_string(&coin_type);

    let _log_claim_amount: u64 = 0;

    if (red_packet.left_amount == 1) {
      red_packet.left_amount = red_packet.left_amount - 1;
      let coin = coin::take(&mut red_packet.coin_amount, left_value, ctx);
      transfer::public_transfer(coin, sender);
      _log_claim_amount = left_value;
    } else {
      let max = (left_value / red_packet.left_amount) * 2;
      let claim_amount = get_random(weather_oracle,max,clock,ctx);
      let claim_split = balance::split(&mut red_packet.coin_amount, claim_amount);
      let claim_value = coin::from_balance(claim_split, ctx);
      red_packet.left_amount = red_packet.left_amount - 1;
      transfer::public_transfer(claim_value, sender);
      _log_claim_amount = claim_amount;
    };

    vector::push_back(&mut red_packet.claimer_addresses,sender);

    event::emit(ClaimRedPacket<T> {
        claim_red_packet_id: object::uid_to_inner(&red_packet.id),
        claimer: sender,
        claim_amount: _log_claim_amount,
        claim_coin_type: coin_type_string,
    })
  }

  fun u32_to_ascii(num: u32): vector<u8>
  {
      if (num == 0) {
          return b"0"
      };
      let bytes = vector::empty<u8>();
      while (num > 0) {
          let remainder = num % 10; // get the last digit
          num = num / 10; // remove the last digit
          vector::push_back(&mut bytes, (remainder as u8) + 48); // ASCII value of 0 is 48
      };
      vector::reverse(&mut bytes);
      return bytes
  }

  fun u64_to_ascii(num: u64): vector<u8>
  {
      if (num == 0) {
          return b"0"
      };
      let bytes = vector::empty<u8>();
      while (num > 0) {
          let remainder = num % 10; // get the last digit
          num = num / 10; // remove the last digit
          vector::push_back(&mut bytes, (remainder as u8) + 48); // ASCII value of 0 is 48
      };
      vector::reverse(&mut bytes);
      return bytes
  }


  fun get_random(weather_oracle: &WeatherOracle, max: u64, clock: &Clock,ctx: &TxContext):u64{

    let sender = tx_context::sender(ctx);
    let tx_digest = tx_context::digest(ctx);
    let random_pressure_p = oracle::weather::city_weather_oracle_pressure(weather_oracle, 2988507);
    let random_pressure_l = oracle::weather::city_weather_oracle_pressure(weather_oracle, 88319);

    let random_vector = vector::empty<u8>();
    vector::append(&mut random_vector, address::to_bytes(copy sender));
    vector::append(&mut random_vector, u32_to_ascii(random_pressure_p));
    vector::append(&mut random_vector, u32_to_ascii(random_pressure_l));
    vector::append(&mut random_vector, u64_to_ascii(clock::timestamp_ms(clock)));
    vector::append(&mut random_vector, *copy tx_digest);

    let temp1 = blake2b256(&random_vector);
    let random_num_ex = bcs::peel_u64(&mut bcs::new(temp1));
    let random_value = ((random_num_ex % max) as u64);
    debug::print(&random_value);
    random_value
  }
}