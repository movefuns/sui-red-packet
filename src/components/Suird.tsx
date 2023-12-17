import { useState } from "react";
import { useInterval } from "ahooks";

function genRandomColor() {
  return Math.floor(Math.random() * 16777215).toString(16);
}

type ColorSet = {
  ear: string;
  body: string;
  eyes: string;
  beak: string;
  wings: string;
};

export default function Suird() {
  const [colorSet, setColorSet] = useState<ColorSet>({
    ear: genRandomColor(),
    body: genRandomColor(),
    eyes: genRandomColor(),
    beak: genRandomColor(),
    wings: genRandomColor(),
  });

  useInterval(() => {
    setColorSet({
      ear: genRandomColor(),
      body: genRandomColor(),
      eyes: genRandomColor(),
      beak: genRandomColor(),
      wings: genRandomColor(),
    });
  }, 400);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="304px"
      height="304px"
      viewBox="0 0 38 38"
      shapeRendering="crispEdges"
    >
      <foreignObject
        width="38"
        height="38"
        style={{ border: "1px solid #fff", background: "#fff" }}
      >
        <style>{`@keyframes i {from {background-position-x:0;}to {background-position-x:-152px;}}`}</style>
        <div>
          <div
            style={{
              top: "-1px",
              position: "absolute",
              animation: "i 0.4s steps(4, end) infinite",
              width: "152px",
              height: "38px",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100%",
              backgroundPosition: "0 0",
              imageRendering: "pixelated",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' shape-rendering='crispEdges' viewBox='0 0 160 40'%3E%3Cdefs%3E%3Cstyle%3E%23lw%7Bfill:%23${colorSet.ear}%7D%23rw%7Bfill:%23${colorSet.ear}%7D%23body%7Bfill:%23${colorSet.body}%7D%23eyes%7Bfill:%23${colorSet.eyes}%7D%23beak%7Bfill:%23${colorSet.beak}%7D%23wings%7Bfill:%23${colorSet.wings}%7D%3C/style%3E%3C/defs%3E%3Cpath id='lw' d='M19 12h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='rw' d='M15 13h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='lw' d='M19 13h1v1h-1zm2 0h1v1h-1zm38 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm78 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='rw' d='M15 14h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='lw' d='M19 14h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='rw' d='M55 14h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='lw' d='M59 14h1v1h-1zm2 0h1v1h-1zm38 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='rw' d='M135 14h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='lw' d='M139 14h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M14 15h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='rw' d='M55 15h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='lw' d='M59 15h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='rw' d='M95 15h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='lw' d='M99 15h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='rw' d='M135 15h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='lw' d='M139 15h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M14 16h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='rw' d='M95 16h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='lw' d='M99 16h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M134 16h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zM14 17h1v1h-1z'/%3E%3Cpath id='eyes' d='M21 17h1v1h-1z'/%3E%3Cpath id='body' d='M23 17h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1zM14 18h1v1h-1z'/%3E%3Cpath id='eyes' d='M21 18h1v1h-1z'/%3E%3Cpath id='body' d='M23 18h1v1h-1zm31 0h1v1h-1z'/%3E%3Cpath id='eyes' d='M61 18h1v1h-1z'/%3E%3Cpath id='body' d='M63 18h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1z'/%3E%3Cpath id='eyes' d='M141 18h1v1h-1z'/%3E%3Cpath id='body' d='M143 18h1v1h-1zM14 19h1v1h-1z'/%3E%3Cpath id='wings' d='M16 19h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M23 19h1v1h-1z'/%3E%3Cpath id='beak' d='M24 19h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M54 19h1v1h-1z'/%3E%3Cpath id='eyes' d='M61 19h1v1h-1z'/%3E%3Cpath id='body' d='M63 19h1v1h-1zm31 0h1v1h-1z'/%3E%3Cpath id='wings' d='M96 19h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='eyes' d='M101 19h1v1h-1z'/%3E%3Cpath id='body' d='M103 19h1v1h-1zm31 0h1v1h-1z'/%3E%3Cpath id='eyes' d='M141 19h1v1h-1z'/%3E%3Cpath id='body' d='M143 19h1v1h-1zM14 20h1v1h-1z'/%3E%3Cpath id='wings' d='M16 20h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M23 20h1v1h-1z'/%3E%3Cpath id='beak' d='M25 20h1v1h-1z'/%3E%3Cpath id='body' d='M54 20h1v1h-1z'/%3E%3Cpath id='wings' d='M56 20h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M63 20h1v1h-1z'/%3E%3Cpath id='beak' d='M64 20h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M94 20h1v1h-1z'/%3E%3Cpath id='wings' d='M96 20h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='eyes' d='M101 20h1v1h-1z'/%3E%3Cpath id='body' d='M103 20h1v1h-1zm31 0h1v1h-1z'/%3E%3Cpath id='wings' d='M136 20h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M143 20h1v1h-1z'/%3E%3Cpath id='beak' d='M144 20h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M14 21h1v1h-1z'/%3E%3Cpath id='wings' d='M16 21h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M23 21h1v1h-1z'/%3E%3Cpath id='beak' d='M24 21h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M54 21h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M65 21h1v1h-1z'/%3E%3Cpath id='body' d='M94 21h1v1h-1z'/%3E%3Cpath id='wings' d='M96 21h1v1h-1zm2 0h1v1h-1z'/%3E%3Cpath id='body' d='M103 21h1v1h-1z'/%3E%3Cpath id='beak' d='M104 21h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M134 21h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M145 21h1v1h-1z'/%3E%3Cpath id='body' d='M14 22h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M64 22h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M94 22h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M105 22h1v1h-1z'/%3E%3Cpath id='body' d='M134 22h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M144 22h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M14 23h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1z'/%3E%3Cpath id='beak' d='M104 23h1v1h-1zm1 0h1v1h-1z'/%3E%3Cpath id='body' d='M134 23h1v1h-1zm9 0h1v1h-1zM17 24h1v1h-1zm3 0h1v1h-1zm34 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm31 0h1v1h-1zm9 0h1v1h-1zm31 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zM17 25h1v1h-1zm3 0h1v1h-1zm37 0h1v1h-1zm3 0h1v1h-1zm34 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm34 0h1v1h-1zm3 0h1v1h-1zm-83 1h1v1h-1zm3 0h1v1h-1zm37 0h1v1h-1zm3 0h1v1h-1zm37 0h1v1h-1zm3 0h1v1h-1zm-43 1h1v1h-1zm3 0h1v1h-1z'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </foreignObject>
    </svg>
  );
}
