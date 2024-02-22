import { Box, Menu, MenuItem, Stack, Typography } from "@mui/material";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSignAndExecuteTransactionBlock,
  useSuiClientInfiniteQuery,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { steps } from "popmotion";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import coinLoading from "./assets/coin-loading.png";
import Coin from "./assets/coin.svg";
import Lion from "./assets/lion.svg";
import luck from "./assets/luck.svg";
import redpacketIcon from "./assets/redpacket.svg";
import { error, gray } from "./theme/colors";
import { shortAddress } from "./utils";
import { red, yellow } from "@mui/material/colors";
import { MoveStruct, SuiEvent } from "@mysten/sui.js/client";
import {
  TransactionBlock,
  TransactionObjectArgument,
} from "@mysten/sui.js/transactions";
import {
  SUI_CLOCK_OBJECT_ID,
  SUI_DECIMALS,
  SUI_TYPE_ARG,
} from "@mysten/sui.js/utils";
import { useDeepCompareEffect } from "ahooks";
import { enqueueSnackbar } from "notistack";
import { fromDust, fromDustToPrecision, toDust } from "./utils/number";

export interface RedPacket {
  amount: string;
  coin_type: string;
  coin_amount: string;
  original_amount: string;
  id: {
    id: string;
  };
  left_amount: string;
  sender: string;
  claimer_addresses: string[];
}

export interface RedPacketClaimRecord {
  claim_amount: string;
  claim_coin_type: string;
  claim_red_packet_id: string;
  claimer: string;
}

export interface SuirdInfo {
  beak: string;
  body: string;
  description: string;
  ear: string;
  eyes: string;
  gene: string;
  image_url: string;
  name: string;
  project_url: string;
  wings: string;
  objectId: string;
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const WEATHER_ORACLE =
  "0x1aedcca0b67b891c64ca113fce87f89835236b4c77294ba7e2db534ad49a58dc";

const PACKAGE_ID =
  "0x87e464f59853db928695824995728316c0358bcdee7044a6534de5cb6cbe5552";
const MODULE_NAME = "red_packet";
const SEND_FUNCTION_NAME = "send_new_red_packet";
const CLAIM_FUNCTION_NAME = "claim_red_packet";

function App() {
  const location = useLocation();

  const currentAccount = useCurrentAccount();
  const [openConnectModal, setOpenConnectModal] = useState(false);

  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const [isSending, setIsSending] = useState(false);

  const [isClaiming, setIsClaiming] = useState<{ [key: string]: boolean }>();

  const navigate = useNavigate();

  const [redPacketValue, setRedPacketValue] = useState("1");
  const [redPacketAmount, setRedPacketAmount] = useState("2");

  const [searcherRedPacket, setSearcherRedPacket] = useState<RedPacket>();

  const {
    data: redPacketEvents,
    refetch: refetchEvents,
    fetchNextPage,
    hasNextPage,
  } = useSuiClientInfiniteQuery(
    "queryEvents",
    {
      query: {
        MoveModule: {
          package: PACKAGE_ID,
          module: "red_packet",
        },
      },
      order: "descending",
    },
    {
      refetchInterval: 10000,
    }
  );
  console.log(
    "🚀 ~ file: App.tsx:110 ~ App ~ redPacketEvents:",
    redPacketEvents
  );

  const newRedPacketEvents = useMemo(() => {
    return (
      redPacketEvents?.pages.map((pEvent) =>
        pEvent.data.filter((event) => event.type.includes("NewRedPacket"))
      ) || []
    ).flat(Infinity) as SuiEvent[];
  }, [redPacketEvents]);
  console.log(
    "🚀 ~ file: App.tsx:130 ~ newRedPacketEvents ~ newRedPacketEvents:",
    newRedPacketEvents.sort(
      (a, b) => Number(b.timestampMs) - Number(a.timestampMs)
    )
  );

  const claimRedPacketEvents = useMemo(() => {
    return (
      redPacketEvents?.pages.map((pEvent) =>
        pEvent.data.filter((event) => event.type.includes("ClaimRedPacket"))
      ) || []
    ).flat(Infinity) as SuiEvent[];
  }, [redPacketEvents]);

  const claimRecord = useMemo(() => {
    let reaPackSet: { [key: string]: RedPacketClaimRecord[] } = {};

    claimRedPacketEvents.forEach((claimRecord) => {
      let id = (claimRecord.parsedJson as RedPacketClaimRecord)
        .claim_red_packet_id;
      if (reaPackSet[id]) {
        reaPackSet[id].push(claimRecord.parsedJson as RedPacketClaimRecord);
      } else {
        reaPackSet[id] = [claimRecord.parsedJson as RedPacketClaimRecord];
      }
    });

    return reaPackSet;
  }, [claimRedPacketEvents]);

  const hasNextPageInternal = useMemo(() => {
    const nextPage =
      (redPacketEvents &&
        redPacketEvents.pages[redPacketEvents.pages.length - 1].hasNextPage) ||
      false;

    if (nextPage) {
      fetchNextPage();
    }

    return nextPage;
  }, [redPacketEvents, redPacketEvents?.pages]);

  const { data: multi, refetch: refetchRedPacketList } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids:
        newRedPacketEvents
          ?.sort((a, b) => Number(b.timestampMs) - Number(a.timestampMs))
          .map((packet) => (packet.parsedJson as any).red_packet_id as string)
          .splice(0, 50) || [],
      options: {
        showContent: true,
      },
    },
    {
      enabled:
        newRedPacketEvents &&
        newRedPacketEvents.length > 0 &&
        !hasNextPageInternal,
      refetchInterval: 10000,
    }
  );

  const redPacketList = useMemo(() => {
    return (
      multi
        ?.filter((i) => i.data?.content?.dataType === "moveObject")
        .map((obj) => {
          let content = obj.data?.content as {
            dataType: "moveObject";
            fields: MoveStruct;
            hasPublicTransfer: boolean;
            type: string;
          };
          return content.fields as unknown as RedPacket;
        })
        .sort((a, b) => {
          if (
            Number(a.left_amount) === 0 ||
            a.claimer_addresses.includes(currentAccount?.address || "")
          ) {
            return 1;
          } else {
            return -1;
          }
        }) || []
    );
  }, [multi, currentAccount?.address]);

  console.log("🚀 ~ file: App.tsx:1054 ~ App ~ redPacketList:", redPacketList);

  const { mutate: disconnect } = useDisconnectWallet();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isErrorNetwork = useMemo(() => {
    return currentAccount && currentAccount?.chains[0] !== "sui:mainnet";
  }, [currentAccount]);

  const isSearcherRedPacketDisabled = useMemo(() => {
    return (
      Number(searcherRedPacket?.left_amount) === 0 ||
      searcherRedPacket?.claimer_addresses.includes(
        currentAccount?.address || ""
      )
    );
  }, [
    searcherRedPacket?.left_amount,
    searcherRedPacket?.claimer_addresses,
    searcherRedPacket?.claimer_addresses.includes(
      currentAccount?.address || ""
    ),
    currentAccount?.address,
  ]);

  useDeepCompareEffect(() => {
    const params = new URLSearchParams(location.search);
    const item = redPacketList.find(
      (redPacket) => redPacket.id.id === params.get("redpacket")
    );
    if (item) {
      setSearcherRedPacket(item);
    }
  }, [location.search, multi, redPacketList]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const item = redPacketList.find(
      (redPacket) => redPacket.id.id === params.get("redpacket")
    );
    if (item) {
      setSearcherRedPacket(item);
    }
  }, [location.search, redPacketList]);

  const claimRedPacket = async (redPacket: RedPacket) => {
    setIsClaiming({ ...isClaiming, [redPacket.id.id]: true });
    let txb = new TransactionBlock();
    SUI_TYPE_ARG;
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${CLAIM_FUNCTION_NAME}`,
      arguments: [
        txb.object(redPacket.id.id),
        txb.object(WEATHER_ORACLE),
        txb.object(SUI_CLOCK_OBJECT_ID),
      ],
      typeArguments: [SUI_TYPE_ARG],
    });

    signAndExecuteTransactionBlock(
      {
        transactionBlock: txb,
        options: {
          showEvents: true,
        },
      },
      {
        async onSuccess(data) {
          await refetchEvents();
          await refetchRedPacketList();

          const claimedAmount = (data.events?.[0].parsedJson as unknown as any)
            .claim_amount;

          enqueueSnackbar(
            `Claimed ${fromDust(claimedAmount, SUI_DECIMALS)} SUI`,
            {
              variant: "success",
              autoHideDuration: 5000,
            }
          );
          setIsClaiming({ ...isClaiming, [redPacket.id.id]: false });
        },
        onError() {
          enqueueSnackbar(String(error), {
            variant: "error",
          });
          setIsClaiming({ ...isClaiming, [redPacket.id.id]: false });
        },
      }
    );
  };

  return (
    <Box
      className="flex w-screen flex-col justify-items-center p-8 justify-start items-center "
      sx={{
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          // mb: "auto",
          position: "fixed",
          top: "2rem",
          right: "2rem",
          zIndex: 1,
        }}
      >
        <ConnectModal
          trigger={
            <Box>
              <button
                className="shadow-2xl nes-btn"
                onClick={currentAccount ? handleClick : undefined}
                style={{
                  backgroundColor: isErrorNetwork ? error[500] : "#fff",
                  width: "140px",
                }}
              >
                {" "}
                {currentAccount
                  ? isErrorNetwork
                    ? "Error Network"
                    : shortAddress(currentAccount.address)
                  : "Connect Wallet"}
              </button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    className: "shadow-xl",
                    sx: {
                      width: "140px",
                      boxShadow: "none",
                      border: `4px solid ${gray[900]}`,
                      borderRadius: 0,
                    },
                  },
                }}
                sx={{
                  boxShadow: "none",
                }}
                MenuListProps={{
                  // className: "nes-btn",
                  sx: {
                    p: 0,
                  },
                  "aria-labelledby": "basic-button",
                  dense: true,
                }}
              >
                <MenuItem
                  onClick={() => {
                    disconnect();
                    handleClose();
                  }}
                >
                  Disconnect
                </MenuItem>
              </Menu>
            </Box>
          }
          open={openConnectModal}
          onOpenChange={(isOpen) => {
            if (!currentAccount) {
              setOpenConnectModal(isOpen);
            }
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "2.5rem",
          display: "flex",
          alignItems: "center",
          mb: "24px",
        }}
      >
        <span>Sui Red Packet</span>
        <img
          src={Lion}
          width="32px"
          style={{
            marginLeft: "24px",
          }}
          alt=""
        />
      </Typography>
      <Box
        sx={{
          mb: "48px",
        }}
      >
        <Stack direction="row" spacing={4}>
          <Box
            className="nes-field"
            sx={{
              label: {
                textAlign: "left",
                fontSize: "1.5rem",
              },
              ".nes-input": {
                padding: "4px 8px",
                mr: "16px",
                width: "120px",
              },
              ".nes-input:focus-visible": {
                outlineColor: "#000",
              },
            }}
          >
            <label>Amount</label>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="number"
                id="name_field"
                className="nes-input"
                value={redPacketValue}
                onChange={(e) => {
                  setRedPacketValue(e.target.value);
                }}
              />
              SUI
            </Box>
          </Box>
          <Box
            className="nes-field"
            sx={{
              label: {
                textAlign: "left",
                fontSize: "1.5rem",
              },
              ".nes-input": {
                padding: "4px 8px",
                mr: "16px",
                width: "100px",
              },
              ".nes-input:focus-visible": {
                outlineColor: "#000",
              },
            }}
          >
            <label>Quantity</label>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="number"
                id="name_field"
                className="nes-input"
                value={redPacketAmount}
                onChange={(e) => {
                  setRedPacketAmount(e.target.value);
                }}
              />
            </Box>
          </Box>
        </Stack>
        <button
          className="nes-btn sending-btn"
          style={{
            marginTop: "24px",
            width: "320px",
            borderImageRepeat: "repeat",
            background: isSending ? gray[300] : red[400],
            color: "#fff",
            fontSize: "1.5rem",
          }}
          disabled={
            isSending ||
            Number(redPacketValue) <= 0 ||
            Number(redPacketAmount) <= 0
          }
          onClick={() => {
            if (!currentAccount?.address) {
              return;
            }
            setIsSending(true);

            setSearcherRedPacket(undefined);
            let txb = new TransactionBlock();

            let transferCoin: TransactionObjectArgument = txb.gas;

            const send_amount = txb.splitCoins(transferCoin, [
              toDust(redPacketValue, SUI_DECIMALS),
            ]);

            txb.moveCall({
              target: `${PACKAGE_ID}::${MODULE_NAME}::${SEND_FUNCTION_NAME}`,
              arguments: [
                txb.pure(Number(redPacketAmount)),
                send_amount,
                txb.pure([]),
              ],
              typeArguments: [SUI_TYPE_ARG],
            });

            txb.setSender(currentAccount.address);

            signAndExecuteTransactionBlock(
              {
                transactionBlock: txb,
                options: {
                  showObjectChanges: true,
                },
              },
              {
                async onSuccess(data) {
                  setSearcherRedPacket(undefined);
                  setIsSending(false);
                  await refetchEvents();
                  await refetchRedPacketList();

                  enqueueSnackbar("Send Success", {
                    variant: "success",
                  });
                },
                onError() {
                  setIsSending(false);
                  enqueueSnackbar(String(error), {
                    variant: "error",
                  });
                  // setSubmitting(false);
                },
              }
            );
          }}
        >
          {isSending ? (
            "···"
          ) : (
            <Stack direction="row" alignItems="center" justifyContent="center">
              Send a red packet{" "}
              <img
                src={redpacketIcon}
                style={{
                  width: "24px",
                  height: "24px",
                  marginLeft: "12px",
                  marginTop: "-4px",
                }}
                alt=""
              />
            </Stack>
          )}
        </button>
      </Box>
      {searcherRedPacket ? (
        <Box>
          <Typography
            sx={{
              fontSize: "1.5rem",
              mb: "24px",
            }}
            onClick={() => {
              navigate(`/`);
              setSearcherRedPacket(undefined);
            }}
          >
            &lt;- Back to list
          </Typography>
          <Stack spacing={4} alignItems="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                columnGap: "24px",
              }}
            >
              <button
                disabled={
                  Number(searcherRedPacket.left_amount) === 0 ||
                  searcherRedPacket.claimer_addresses.includes(
                    currentAccount?.address || ""
                  )
                }
                className="nes-btn red-packet-button"
                onClick={() => {
                  claimRedPacket(searcherRedPacket);
                }}
                style={{
                  borderImageRepeat: "repeat",
                }}
              >
                <Stack
                  sx={{
                    color: yellow[300],
                    p: "4px",
                  }}
                  spacing={2}
                >
                  <Box>ID: {shortAddress(searcherRedPacket.id.id)}</Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      visibility:
                        Number(searcherRedPacket.left_amount) === 0 ||
                        searcherRedPacket.claimer_addresses.includes(
                          currentAccount?.address || ""
                        )
                          ? "hidden"
                          : "visible",
                    }}
                  >
                    <Typography
                      sx={{
                        color: yellow[50],
                        mr: "12px",
                        fontSize: "2rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {fromDustToPrecision(
                        searcherRedPacket.coin_amount,
                        SUI_DECIMALS
                      ).toString()}{" "}
                      SUI
                    </Typography>
                    <img src={Coin} width="24px" alt="" />
                  </Stack>
                  <Box>
                    {searcherRedPacket.left_amount} / {searcherRedPacket.amount}
                  </Box>
                </Stack>
                {isSearcherRedPacketDisabled && (
                  <Box
                    sx={{
                      background: "rgba(183,137,136,0.7)",
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        opacity: 1,
                        position: "relative",
                        color: "#d5ff00",
                        display: "flex",
                        fontSize: searcherRedPacket.claimer_addresses.includes(
                          currentAccount?.address || ""
                        )
                          ? "2rem"
                          : "1.5rem",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          opacity: 1,
                        }}
                      >
                        {searcherRedPacket.claimer_addresses.includes(
                          currentAccount?.address || ""
                        )
                          ? "CLAIMED"
                          : "FULLY CLAIMED"}
                      </span>
                      <img
                        src={luck}
                        width="36px"
                        style={{
                          marginTop: "-4px",
                          marginLeft: "6px",
                        }}
                        alt=""
                      />
                    </Typography>
                  </Box>
                )}

                {isClaiming?.[searcherRedPacket.id.id] && (
                  <Box
                    sx={{
                      background: "rgba(183,137,136,0.7)",
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <motion.div
                      animate={{ backgroundPositionX: ["0px", "-192px"] }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        ease: steps(4),
                      }}
                      style={{
                        opacity: 1,
                        width: "48px",
                        height: "48px",
                        backgroundImage: `url(${coinLoading})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "400%",
                      }}
                    ></motion.div>
                  </Box>
                )}
              </button>
            </Box>
            <Box
              sx={{
                fontSize: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {shortAddress(searcherRedPacket.sender)}
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                Sent you a red packet{" "}
                <img
                  src={redpacketIcon}
                  style={{
                    marginLeft: "12px",
                    width: "24px",
                    height: "24px",
                  }}
                  alt=""
                />
              </Stack>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                }}
              >
                worth{" "}
                {fromDust(
                  searcherRedPacket.original_amount,
                  SUI_DECIMALS
                ).toString()}{" "}
                SUI
              </Typography>

              {claimRecord[searcherRedPacket.id.id] && (
                <Box>
                  <Box
                    sx={{
                      mt: "24px",
                      fontSize: "1.5rem",
                    }}
                  >
                    Claim Records
                  </Box>
                  <Box>
                    {claimRecord[searcherRedPacket.id.id].map((record) => {
                      return (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          justifyContent="center"
                        >
                          <Typography>
                            {shortAddress(record.claimer)}
                          </Typography>
                          <Typography>
                            {fromDust(
                              record.claim_amount,
                              SUI_DECIMALS
                            ).toString()}{" "}
                            SUI
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Typography
                sx={{
                  mt: "48px",
                  maxWidth: "50%",
                  color: gray[400],
                }}
              >
                Due to the use of timestamps and the transaction hash as part of
                the random seed when opening the red envelope, the final amount
                received may differ from what is displayed in the wallet's
                simulated transaction.
              </Typography>
            </Box>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Stack
            direction="row"
            display="grid"
            // flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            gridTemplateColumns="repeat(auto-fit, 280px)"
            gap={2}
            sx={{
              width: "90%",
              gridAutoFlow: "dense",
            }}
          >
            {redPacketList.map((redPacket) => {
              const isDisabled =
                Number(redPacket.left_amount) === 0 ||
                redPacket.claimer_addresses.includes(
                  currentAccount?.address || ""
                );
              const isClaimed = redPacket.claimer_addresses.includes(
                currentAccount?.address || ""
              );
              return (
                <button
                  key={redPacket.id.id}
                  className="nes-btn red-packet-button"
                  onClick={() => {
                    navigate(`/?redpacket=${redPacket.id.id}`);
                    setSearcherRedPacket(redPacket);
                  }}
                  ref={(node) => {
                    if (node && isDisabled) {
                      node.style.setProperty(
                        "background-color",
                        "#b78988",
                        "important"
                      );
                    }
                  }}
                  style={{
                    borderImageRepeat: "repeat",
                  }}
                >
                  <Stack
                    sx={{
                      color: yellow[300],
                      p: "4px",
                    }}
                    spacing={1.5}
                  >
                    <Box>ID: {shortAddress(redPacket.id.id)}</Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {Number(redPacket?.left_amount) === 0 ? (
                        <Typography
                          sx={{
                            color: yellow[50],
                            mr: "12px",
                            fontSize: "1.5rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          FULLY CLAIMED
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              color: yellow[50],
                              mr: "12px",
                              fontSize: "2rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                            }}
                          >
                            {fromDustToPrecision(
                              redPacket.coin_amount,
                              SUI_DECIMALS
                            ).toString()}{" "}
                            SUI
                          </Typography>
                          <img src={Coin} width="24px" alt="" />
                        </>
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        mt: "-4px !important",
                        color: yellow[50],
                      }}
                    >
                      Total:{" "}
                      {fromDustToPrecision(
                        redPacket.original_amount,
                        SUI_DECIMALS
                      ).toString()}{" "}
                      SUI
                    </Typography>
                    <Box
                      sx={{
                        mt: "8px !important",
                      }}
                    >
                      {redPacket.left_amount} / {redPacket.amount}
                    </Box>
                  </Stack>
                  {redPacket.claimer_addresses.includes(
                    currentAccount?.address || ""
                  ) && (
                    <Box
                      sx={{
                        // background: "rgba(183,137,136,0.4)",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography
                        sx={{
                          opacity: 1,
                          position: "absolute",
                          top: "-2px",
                          left: "4px",
                          color: "#d5ff00",
                          display: "flex",
                          // fontSize: isClaimed ? "2rem" : "1.5rem",
                          fontSize: "0.75rem",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          textAlign: "left",
                          width: "30%",
                        }}
                      >
                        <span
                          style={{
                            opacity: 1,
                          }}
                        >
                          CLAIMED
                        </span>
                      </Typography>
                    </Box>
                  )}
                  {isClaiming?.[redPacket.id.id] && (
                    <Box
                      sx={{
                        background: "rgba(183,137,136,0.7)",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <motion.div
                        animate={{ backgroundPositionX: ["0px", "-192px"] }}
                        transition={{
                          duration: 0.4,
                          repeat: Infinity,
                          ease: steps(4),
                        }}
                        style={{
                          opacity: 1,
                          width: "48px",
                          height: "48px",
                          backgroundImage: `url(${coinLoading})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "400%",
                        }}
                      ></motion.div>
                    </Box>
                  )}
                </button>
              );
            })}
          </Stack>
          {hasNextPageInternal && (
            <button
              style={{
                width: "200px",
                marginTop: "24px",
                borderImageRepeat: "repeat",
              }}
              className="nes-btn"
              onClick={() => {
                fetchNextPage();
              }}
            >
              Load More
            </button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default App;
