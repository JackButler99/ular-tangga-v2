import Image from "next/image";
import { LADDERS, SNAKES } from "@/lib/game";

type DecorationType = "snake" | "ladder";

type BoardDecorationProps = {
  from: number;
  to: number;
  type: DecorationType;
};

const ORIGINAL_SNAKE_STARTS = new Set<number>([44, 87]);

const V1_SNAKE_ANCHORS = {
  head: 0.01,
  tail: 0.99,
} as const;


function getCellCenter(cell: number) {
  const zeroBasedCell = cell - 1;
  const rowFromBottom = Math.floor(zeroBasedCell / 10);
  const positionInRow = zeroBasedCell % 10;
  const column =
    rowFromBottom % 2 === 0 ? positionInRow : 9 - positionInRow;
  const rowFromTop = 9 - rowFromBottom;

  return {
    x: (column + 0.5) * 10,
    y: (rowFromTop + 0.5) * 10,
  };
}

function BoardDecoration({
  from,
  to,
  type,
}: BoardDecorationProps) {
  const fromPoint = getCellCenter(from);
  const toPoint = getCellCenter(to);

  const startPoint = type === "ladder" ? toPoint : fromPoint;
  const endPoint = type === "ladder" ? fromPoint : toPoint;

  const differenceX = endPoint.x - startPoint.x;
  const differenceY = endPoint.y - startPoint.y;

  const distance = Math.sqrt(
    differenceX ** 2 + differenceY ** 2,
  );

  const angle =
    (Math.atan2(differenceY, differenceX) * 180) / Math.PI - 90;

  const usesV1Snake =
    type === "snake" && ORIGINAL_SNAKE_STARTS.has(from);

  const imageSource =
    type === "ladder"
      ? "/assets/ladder-cute-v2.png"
      : usesV1Snake
        ? "/assets/snake-cute.png"
        : "/assets/snake-cute-v2.png";

  // Perhitungan normal untuk tangga dan ular v2.
  const regularScale = type === "ladder" ? 1.12 : 1.18;

  // Koreksi khusus gambar ular v1.
  const v1AnchorSpan =
    V1_SNAKE_ANCHORS.tail - V1_SNAKE_ANCHORS.head;

  const imageHeight = usesV1Snake
    ? distance / v1AnchorSpan
    : distance * regularScale;

  const centerProgress = usesV1Snake
    ? (0.5 - V1_SNAKE_ANCHORS.head) / v1AnchorSpan
    : 0.5;

  const centerX =
    startPoint.x + differenceX * centerProgress;

  const centerY =
    startPoint.y + differenceY * centerProgress;

  const rotationOffset = usesV1Snake ? -12 : 0;
  
  return (
    <Image
      src={imageSource}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={1024}
      height={1536}
      unoptimized
      className="pointer-events-none absolute z-10 max-w-none select-none"
      style={{
        left: `${centerX}%`,
        top: `${centerY}%`,
        height: `${imageHeight}%`,
        width: "auto",
        opacity: usesV1Snake ? 0.82 : 0.92,
        transform: `translate(-50%, -50%) rotate(${angle + rotationOffset}deg)`,
        transformOrigin: "center",
      }}
    />
  );
}

export function BoardDecorations() {
  return (
    <div className="board-decoration-layer" aria-hidden="true">
      {Object.entries(LADDERS).map(([from, to]) => (
        <BoardDecoration
          key={`ladder-${from}`}
          from={Number(from)}
          to={to}
          type="ladder"
        />
      ))}

      {Object.entries(SNAKES).map(([from, to]) => (
        <BoardDecoration
          key={`snake-${from}`}
          from={Number(from)}
          to={to}
          type="snake"
        />
      ))}
    </div>
  );
}
