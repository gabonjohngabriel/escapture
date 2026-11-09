import React from "react";
import { cn } from "@/lib/cn";

export type UserAvatarProps = {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
};

// Deterministic 32-bit integer hash from string
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (31 * h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(arr: readonly T[], hash: number, shift: number): T {
  return arr[(hash >>> shift) % arr.length];
}

function adjustColor(hex: string, ratio: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const target = ratio > 0 ? 255 : 0;
  const abs = Math.abs(ratio);
  const r = Math.round(((num >> 16) & 255) + (target - ((num >> 16) & 255)) * abs);
  const g = Math.round(((num >> 8) & 255) + (target - ((num >> 8) & 255)) * abs);
  const b = Math.round((num & 255) + (target - (num & 255)) * abs);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const SKINS = [
  "#fbd5cb",
  "#f6cdb2",
  "#eab792",
  "#d9a077",
  "#c1875c",
  "#a26a43",
  "#7d4e31",
  "#5b3621",
] as const;

const HAIR_COLORS = [
  "#1d1a1f",
  "#3d2a22",
  "#6e4630",
  "#9c4a2c",
  "#356246",
  "#203e2c",
  "#da6a7d",
  "#a990d8",
] as const;

const OUTFIT_COLORS = [
  "#52946b",
  "#356246",
  "#294d37",
  "#1e2a22",
  "#da6a7d",
  "#427a56",
  "#6fa77f",
] as const;

const BG_COLORS = [
  "#e3efe7",
  "#f2f7f4",
  "#c7e0ce",
  "#fdf3e1",
  "#e4f1e8",
  "#edf2ef",
] as const;

const FACE_SHAPES = {
  round:
    "M100,206 C100,140 146,108 200,108 C254,108 300,140 300,206 C300,262 258,294 200,294 C142,294 100,262 100,206Z",
  mochi:
    "M96,212 C96,138 144,110 200,110 C256,110 304,138 304,212 C304,258 270,292 200,292 C130,292 96,258 96,212Z",
  heart:
    "M102,200 C102,136 148,108 200,108 C252,108 298,136 298,200 C298,252 248,296 200,298 C152,296 102,252 102,200Z",
  oval:
    "M108,202 C108,130 152,100 200,100 C248,100 292,130 292,202 C292,270 250,308 200,308 C150,308 108,270 108,202Z",
} as const;

const BANGS = {
  strands:
    "M90,262 C76,150 124,70 200,70 C276,70 324,150 310,262 C304,220 296,190 282,168 C278,196 270,212 258,224 C262,190 252,160 232,142 C226,172 210,190 190,202 C198,176 196,156 186,144 C168,168 146,182 122,190 C130,176 134,164 132,156 C112,184 98,220 90,262Z",
  blunt:
    "M90,250 C78,148 124,70 200,70 C276,70 322,148 310,250 C306,220 300,200 292,190 C250,198 150,198 108,190 C100,200 94,220 90,250Z",
  side:
    "M90,256 C78,150 124,70 200,70 C276,70 322,150 310,256 C302,200 284,166 256,152 C228,180 172,198 120,196 C106,210 96,232 90,256Z",
  curtain:
    "M90,262 C78,150 124,70 200,70 C276,70 322,150 310,262 C304,206 268,150 206,134 L194,134 C132,150 96,206 90,262Z",
  none:
    "M96,204 C96,118 146,74 200,74 C254,74 304,118 304,204 C292,150 252,124 200,124 C148,124 108,150 96,204Z",
} as const;

export function UserAvatar({
  seed,
  size,
  className,
  title,
}: UserAvatarProps) {
  const hash = hashString(seed || "user");

  const skin = pick(SKINS, hash, 0);
  const hairColor = pick(HAIR_COLORS, hash, 3);
  const outfitColor = pick(OUTFIT_COLORS, hash, 6);
  const bgColor = pick(BG_COLORS, hash, 9);
  const faceShape = pick(["round", "mochi", "heart", "oval"] as const, hash, 12);
  const bangs = pick(["strands", "blunt", "side", "curtain", "none"] as const, hash, 14);
  const hairStyle = pick(
    ["wavy", "shortwavy", "pixie", "straight", "bob", "ponytail", "bun", "spacebuns"] as const,
    hash,
    17,
  );
  const eyes = pick(["dot", "sparkle", "happy", "wink", "lashes"] as const, hash, 20);
  const mouth = pick(["open", "smile", "cat", "grin"] as const, hash, 23);
  const blush = pick(["hatch", "round", "freckles", "none"] as const, hash, 25);
  const hasGlasses = ((hash >>> 27) % 3) === 0;
  const glassesType = pick(["round", "square", "cateye"] as const, hash, 28);

  const earColor = adjustColor(skin, -0.06);
  const hairHighlight = adjustColor(hairColor, 0.4);
  const strokeColor = "#151318";
  const blushPink = "#da6a7d";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full select-none",
        className,
      )}
      style={size ? { width: size, height: size } : undefined}
      title={title || seed}
      aria-hidden="true"
    >
      <svg
        viewBox="0 20 400 400"
        className="size-full shrink-0 object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle / rect */}
        <rect width="400" height="420" fill={bgColor} />

        {/* Back Hair */}
        <g fill={hairColor}>
          {hairStyle === "wavy" && (
            <path d="M200,56 C120,56 78,108 76,190 C74,228 54,244 60,278 C66,308 84,318 72,348 C62,374 44,384 38,404 C64,416 96,406 108,388 L292,388 C304,406 336,416 362,404 C356,384 338,374 328,348 C316,318 334,308 340,278 C346,244 326,228 324,190 C322,108 280,56 200,56Z" />
          )}
          {hairStyle === "shortwavy" && (
            <path d="M200,60 C120,60 80,110 80,196 C78,232 64,250 72,276 C78,296 66,310 54,320 C80,330 106,320 114,300 L286,300 C294,320 320,330 346,320 C334,310 322,296 328,276 C336,250 322,232 320,196 C320,110 280,60 200,60Z" />
          )}
          {hairStyle === "pixie" && (
            <path d="M200,66 C122,66 88,116 88,190 C88,212 92,226 98,234 L302,234 C308,226 312,212 312,190 C312,116 278,66 200,66Z" />
          )}
          {hairStyle === "straight" && (
            <path d="M200,60 C120,60 80,110 80,196 L74,410 L326,410 L320,196 C320,110 280,60 200,60Z" />
          )}
          {hairStyle === "bob" && (
            <path d="M200,62 C118,62 80,112 80,200 C80,256 82,290 94,306 C140,318 260,318 306,306 C318,290 320,256 320,200 C320,112 282,62 200,62Z" />
          )}
          {hairStyle === "ponytail" && (
            <g>
              <path d="M292,118 C350,126 372,200 360,268 C354,306 368,338 384,352 C342,362 318,332 320,292 C322,244 318,192 286,150Z" />
              <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
            </g>
          )}
          {hairStyle === "bun" && (
            <g>
              <circle cx="200" cy="64" r="40" />
              <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
            </g>
          )}
          {hairStyle === "spacebuns" && (
            <g>
              <circle cx="122" cy="82" r="34" />
              <circle cx="278" cy="82" r="34" />
              <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
            </g>
          )}
        </g>

        {/* Neck */}
        <rect x="176" y="268" width="48" height="72" rx="16" fill={skin} />

        {/* Outfit */}
        <g>
          <path
            d="M78,432 C78,368 112,326 152,313 C160,310 166,308 172,308 C175,326 186,336 200,336 C214,336 225,326 228,308 C234,308 240,310 248,313 C288,326 322,368 322,432Z"
            fill={outfitColor}
            stroke={adjustColor(outfitColor, -0.25)}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Collar / Detail */}
          <path
            d="M166,312 C172,326 184,334 200,334 C216,334 228,326 234,312"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Ears */}
        <circle cx="101" cy="228" r="18" fill={earColor} />
        <circle cx="299" cy="228" r="18" fill={earColor} />

        {/* Face */}
        <path d={FACE_SHAPES[faceShape]} fill={skin} />

        {/* Blush */}
        {blush === "hatch" && (
          <g>
            <ellipse cx="136" cy="252" rx="17" ry="10" fill={blushPink} opacity="0.3" />
            <ellipse cx="264" cy="252" rx="17" ry="10" fill={blushPink} opacity="0.3" />
            <path
              d="M128,258 l7,-12 M138,260 l7,-12 M256,258 l7,-12 M266,260 l7,-12"
              stroke={blushPink}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}
        {blush === "round" && (
          <g fill={blushPink} opacity="0.45">
            <ellipse cx="136" cy="252" rx="17" ry="10" />
            <ellipse cx="264" cy="252" rx="17" ry="10" />
          </g>
        )}
        {blush === "freckles" && (
          <g fill={adjustColor(skin, -0.4)}>
            {[
              [128, 248],
              [138, 254],
              [146, 246],
              [254, 246],
              [262, 254],
              [272, 248],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" />
            ))}
          </g>
        )}

        {/* Eyebrows */}
        <path
          d="M148,196 Q158,186 174,190"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M252,196 Q242,186 226,190"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes */}
        {eyes === "sparkle" ? (
          <g>
            <ellipse cx="162" cy="222" rx="11" ry="15" fill={strokeColor} />
            <circle cx="165" cy="216" r="4.5" fill="#fff" />
            <circle cx="158" cy="228" r="2.2" fill="#fff" />
            <ellipse cx="238" cy="222" rx="11" ry="15" fill={strokeColor} />
            <circle cx="241" cy="216" r="4.5" fill="#fff" />
            <circle cx="234" cy="228" r="2.2" fill="#fff" />
          </g>
        ) : eyes === "happy" ? (
          <g
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M150,226 Q162,208 174,226" />
            <path d="M226,226 Q238,208 250,226" />
          </g>
        ) : eyes === "wink" ? (
          <g>
            <ellipse cx="162" cy="222" rx="8.5" ry="13" fill={strokeColor} />
            <path
              d="M246,213 L231,222 L246,231"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        ) : eyes === "lashes" ? (
          <g>
            <ellipse cx="162" cy="222" rx="8.5" ry="13" fill={strokeColor} />
            <path
              d="M155,212 l-8,-6 M153,219 l-9,-2"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <ellipse cx="238" cy="222" rx="8.5" ry="13" fill={strokeColor} />
            <path
              d="M245,212 l8,-6 M247,219 l9,-2"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g>
            <ellipse cx="162" cy="222" rx="8.5" ry="13" fill={strokeColor} />
            <ellipse cx="238" cy="222" rx="8.5" ry="13" fill={strokeColor} />
          </g>
        )}

        {/* Mouth */}
        {mouth === "open" ? (
          <g>
            <path
              d="M184,250 Q200,248 216,250 Q215,272 200,274 Q185,272 184,250Z"
              fill="#4a1f2b"
            />
            <path
              d="M190,266 Q200,256 210,266 Q200,276 190,266Z"
              fill={blushPink}
            />
          </g>
        ) : mouth === "cat" ? (
          <path
            d="M184,252 Q192,262 200,253 Q208,262 216,252"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : mouth === "grin" ? (
          <g>
            <path
              d="M182,249 Q200,247 218,249 Q216,274 200,275 Q184,274 182,249Z"
              fill="#4a1f2b"
            />
            <path
              d="M184,250 Q200,248 216,250 L215,256 Q200,258 185,256Z"
              fill="#fff"
            />
          </g>
        ) : (
          <path
            d="M186,252 Q200,265 214,252"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Front Hair / Bangs */}
        <g fill={hairColor}>
          <path d={BANGS[bangs]} />
          <path
            d="M162,94 Q200,78 238,94"
            stroke={hairHighlight}
            strokeOpacity="0.8"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Glasses (optional) */}
        {hasGlasses && (
          <g>
            {glassesType === "round" && (
              <g
                stroke={strokeColor}
                strokeWidth="4.5"
                fill="#ffffff"
                fillOpacity="0.15"
                strokeLinejoin="round"
              >
                <circle cx="162" cy="222" r="24" />
                <circle cx="238" cy="222" r="24" />
                <path d="M186,220 Q200,212 214,220" fill="none" />
              </g>
            )}
            {glassesType === "square" && (
              <g
                stroke={strokeColor}
                strokeWidth="4.5"
                fill="#ffffff"
                fillOpacity="0.15"
                strokeLinejoin="round"
              >
                <rect x="136" y="202" width="52" height="40" rx="9" />
                <rect x="212" y="202" width="52" height="40" rx="9" />
                <path d="M186,220 Q200,212 214,220" fill="none" />
              </g>
            )}
            {glassesType === "cateye" && (
              <g
                stroke={strokeColor}
                strokeWidth="4.5"
                fill="#ffffff"
                fillOpacity="0.15"
                strokeLinejoin="round"
              >
                <path d="M134,208 Q160,198 190,208 Q190,240 164,243 Q138,240 134,208Z M134,208 l-9,-9" />
                <path d="M266,208 Q240,198 210,208 Q210,240 236,243 Q262,240 266,208Z M266,208 l9,-9" />
                <path d="M186,220 Q200,212 214,220" fill="none" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
