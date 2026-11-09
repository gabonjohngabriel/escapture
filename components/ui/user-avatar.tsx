import React from "react";
import { cn } from "@/lib/cn";

export type UserAvatarProps = {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
  gender?: "male" | "female" | "neutral";
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

const MALE_NAMES = new Set([
  "nico",
  "rafael",
  "angelo",
  "agustin",
  "perez",
  "jules",
  "miguel",
  "juan",
  "carlos",
  "alexander",
  "john",
  "david",
  "mark",
  "jose",
  "christian",
  "gabriel",
  "daniel",
  "joshua",
  "anthony",
  "paolo",
  "luis",
  "mateo",
  "diego",
  "ramon",
  "eduardo",
  "fernando",
  "victor",
  "manuel",
  "pedro",
  "roberto",
  "ricardo",
  "alberto",
  "ben",
  "benjamin",
]);

const FEMALE_NAMES = new Set([
  "maya",
  "santos",
  "maria",
  "mary",
  "anna",
  "ana",
  "clara",
  "sofia",
  "isabella",
  "bea",
  "chloe",
  "gabrielle",
  "patricia",
  "alyssa",
  "nicole",
  "sarah",
  "angelica",
  "camille",
  "raven",
  "bituin",
  "rose",
  "grace",
]);

export function detectGender(seed: string): "male" | "female" | "neutral" {
  if (!seed) return "neutral";
  const normalized = seed.toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (MALE_NAMES.has(token)) return "male";
    if (FEMALE_NAMES.has(token)) return "female";
  }

  return "neutral";
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
  "#4a3728",
  "#28201a",
] as const;

const OUTFIT_COLORS = [
  "#52946b",
  "#356246",
  "#294d37",
  "#1e2a22",
  "#2b3a4a",
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

const FEMALE_FACE_SHAPES = {
  round:
    "M100,206 C100,140 146,108 200,108 C254,108 300,140 300,206 C300,262 258,294 200,294 C142,294 100,262 100,206Z",
  mochi:
    "M96,212 C96,138 144,110 200,110 C256,110 304,138 304,212 C304,258 270,292 200,292 C130,292 96,258 96,212Z",
  heart:
    "M102,200 C102,136 148,108 200,108 C252,108 298,136 298,200 C298,252 248,296 200,298 C152,296 102,252 102,200Z",
  oval:
    "M108,202 C108,130 152,100 200,100 C248,100 292,130 292,202 C292,270 250,308 200,308 C150,308 108,270 108,202Z",
} as const;

const MALE_FACE_SHAPES = {
  square:
    "M102,196 C102,132 148,106 200,106 C252,106 298,132 298,196 C298,256 264,296 226,306 L174,306 C136,296 102,256 102,196Z",
  chiseled:
    "M104,198 C104,134 148,106 200,106 C252,106 296,134 296,198 C296,252 256,292 218,304 L182,304 C144,292 104,252 104,198Z",
  oval:
    "M106,200 C106,130 150,100 200,100 C250,100 294,130 294,200 C294,270 252,308 200,308 C148,308 106,270 106,200Z",
  round:
    "M100,204 C100,138 146,106 200,106 C254,106 300,138 300,204 C300,262 258,296 200,296 C142,296 100,262 100,204Z",
} as const;

const FEMALE_BANGS = {
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
  gender: propGender,
}: UserAvatarProps) {
  const hash = hashString(seed || "user");
  const detected = detectGender(seed || title || "");
  const effectiveGender =
    propGender && propGender !== "neutral"
      ? propGender
      : detected !== "neutral"
      ? detected
      : (hash >>> 11) % 2 === 0
      ? "female"
      : "male";

  const isMale = effectiveGender === "male";

  const skin = pick(SKINS, hash, 0);
  const hairColor = pick(HAIR_COLORS, hash, 3);
  const outfitColor = pick(OUTFIT_COLORS, hash, 6);
  const bgColor = pick(BG_COLORS, hash, 9);

  // Female-specific picks
  const femaleFaceShape = pick(["round", "mochi", "heart", "oval"] as const, hash, 12);
  const bangs = pick(["strands", "blunt", "side", "curtain", "none"] as const, hash, 14);
  const femaleHairStyle = pick(
    ["wavy", "shortwavy", "pixie", "straight", "bob", "ponytail", "bun", "spacebuns"] as const,
    hash,
    17,
  );
  const femaleEyes = pick(["dot", "sparkle", "happy", "wink", "lashes"] as const, hash, 20);
  const femaleBlush = pick(["hatch", "round", "freckles", "none"] as const, hash, 25);
  const femaleGlassesType = pick(["round", "square", "cateye"] as const, hash, 28);

  // Male-specific picks
  const maleFaceShape = pick(["square", "chiseled", "oval", "round"] as const, hash, 12);
  const maleHairStyle = pick(
    ["quiff", "side_part", "crop", "buzz", "wavy_short", "slick"] as const,
    hash,
    17,
  );
  const maleEyes = pick(["focused", "confident", "happy", "wink"] as const, hash, 20);
  const maleFacialHair = pick(
    ["clean", "stubble", "goatee", "clean", "beard_shadow"] as const,
    hash,
    22,
  );
  const maleBlush = pick(["none", "none", "freckles", "none"] as const, hash, 25);
  const maleGlassesType = pick(["square", "round", "wire"] as const, hash, 28);

  const mouth = pick(["open", "smile", "cat", "grin"] as const, hash, 23);
  const hasGlasses = ((hash >>> 27) % 3) === 0;

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
          {isMale ? (
            <>
              {maleHairStyle === "quiff" && (
                <path d="M200,44 C130,44 86,100 86,190 C86,218 92,236 98,244 L302,244 C308,236 314,218 314,190 C314,100 270,44 200,44Z" />
              )}
              {maleHairStyle === "side_part" && (
                <path d="M200,56 C132,56 88,110 88,194 C88,220 92,236 98,244 L302,244 C308,236 312,220 312,194 C312,110 268,56 200,56Z" />
              )}
              {maleHairStyle === "crop" && (
                <path d="M200,62 C134,62 90,114 90,196 C90,222 94,236 100,244 L300,244 C306,236 310,222 310,196 C310,114 266,62 200,62Z" />
              )}
              {maleHairStyle === "buzz" && (
                <path d="M200,72 C138,72 94,122 94,198 C94,222 96,234 100,242 L300,242 C304,234 306,222 306,198 C306,122 262,72 200,72Z" />
              )}
              {maleHairStyle === "wavy_short" && (
                <path d="M200,52 C128,52 86,104 86,192 C86,220 92,236 98,244 L302,244 C308,236 314,220 314,192 C314,104 272,52 200,52Z" />
              )}
              {maleHairStyle === "slick" && (
                <path d="M200,54 C132,54 88,108 88,192 C88,218 92,234 98,242 L302,242 C308,234 312,218 312,192 C312,108 268,54 200,54Z" />
              )}
            </>
          ) : (
            <>
              {femaleHairStyle === "wavy" && (
                <path d="M200,56 C120,56 78,108 76,190 C74,228 54,244 60,278 C66,308 84,318 72,348 C62,374 44,384 38,404 C64,416 96,406 108,388 L292,388 C304,406 336,416 362,404 C356,384 338,374 328,348 C316,318 334,308 340,278 C346,244 326,228 324,190 C322,108 280,56 200,56Z" />
              )}
              {femaleHairStyle === "shortwavy" && (
                <path d="M200,60 C120,60 80,110 80,196 C78,232 64,250 72,276 C78,296 66,310 54,320 C80,330 106,320 114,300 L286,300 C294,320 320,330 346,320 C334,310 322,296 328,276 C336,250 322,232 320,196 C320,110 280,60 200,60Z" />
              )}
              {femaleHairStyle === "pixie" && (
                <path d="M200,66 C122,66 88,116 88,190 C88,212 92,226 98,234 L302,234 C308,226 312,212 312,190 C312,116 278,66 200,66Z" />
              )}
              {femaleHairStyle === "straight" && (
                <path d="M200,60 C120,60 80,110 80,196 L74,410 L326,410 L320,196 C320,110 280,60 200,60Z" />
              )}
              {femaleHairStyle === "bob" && (
                <path d="M200,62 C118,62 80,112 80,200 C80,256 82,290 94,306 C140,318 260,318 306,306 C318,290 320,256 320,200 C320,112 282,62 200,62Z" />
              )}
              {femaleHairStyle === "ponytail" && (
                <g>
                  <path d="M292,118 C350,126 372,200 360,268 C354,306 368,338 384,352 C342,362 318,332 320,292 C322,244 318,192 286,150Z" />
                  <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
                </g>
              )}
              {femaleHairStyle === "bun" && (
                <g>
                  <circle cx="200" cy="64" r="40" />
                  <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
                </g>
              )}
              {femaleHairStyle === "spacebuns" && (
                <g>
                  <circle cx="122" cy="82" r="34" />
                  <circle cx="278" cy="82" r="34" />
                  <path d="M200,64 C118,64 84,118 84,204 C84,236 90,254 98,266 L302,266 C310,254 316,236 316,204 C316,118 282,64 200,64Z" />
                </g>
              )}
            </>
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
          {isMale ? (
            <path
              d="M172,308 L200,334 L228,308"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : (
            <path
              d="M166,312 C172,326 184,334 200,334 C216,334 228,326 234,312"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* Ears */}
        <circle cx="101" cy="228" r="18" fill={earColor} />
        <circle cx="299" cy="228" r="18" fill={earColor} />

        {/* Face */}
        <path
          d={isMale ? MALE_FACE_SHAPES[maleFaceShape] : FEMALE_FACE_SHAPES[femaleFaceShape]}
          fill={skin}
        />

        {/* Male Facial Hair / Stubble (rendered under mouth & eyes) */}
        {isMale && (
          <g>
            {maleFacialHair === "stubble" && (
              <g>
                <path
                  d="M140,252 C140,288 162,300 200,300 C238,300 260,288 260,252 C260,274 238,294 200,294 C162,294 140,274 140,252Z"
                  fill={adjustColor(hairColor, -0.3)}
                  opacity="0.22"
                />
                <ellipse
                  cx="200"
                  cy="245"
                  rx="20"
                  ry="4"
                  fill={adjustColor(hairColor, -0.3)}
                  opacity="0.18"
                />
              </g>
            )}
            {maleFacialHair === "goatee" && (
              <g fill={hairColor}>
                <path d="M184,244 Q200,240 216,244 Q200,249 184,244Z" />
                <path d="M192,282 Q200,298 208,282 Q200,288 192,282Z" />
              </g>
            )}
            {maleFacialHair === "beard_shadow" && (
              <path
                d="M136,248 C136,290 160,302 200,302 C240,302 264,290 264,248 C264,272 238,296 200,296 C162,296 136,272 136,248Z"
                fill={adjustColor(hairColor, -0.25)}
                opacity="0.15"
              />
            )}
          </g>
        )}

        {/* Blush / Freckles */}
        {!isMale && femaleBlush === "hatch" && (
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
        {!isMale && femaleBlush === "round" && (
          <g fill={blushPink} opacity="0.45">
            <ellipse cx="136" cy="252" rx="17" ry="10" />
            <ellipse cx="264" cy="252" rx="17" ry="10" />
          </g>
        )}
        {((!isMale && femaleBlush === "freckles") || (isMale && maleBlush === "freckles")) && (
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
        {isMale ? (
          <g>
            <path
              d="M140,195 Q158,186 178,190"
              stroke={strokeColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M260,195 Q242,186 222,190"
              stroke={strokeColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : (
          <g>
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
          </g>
        )}

        {/* Eyes */}
        {isMale ? (
          maleEyes === "focused" ? (
            <g>
              <ellipse cx="162" cy="222" rx="9" ry="13" fill={strokeColor} />
              <circle cx="165" cy="217" r="3.5" fill="#fff" />
              <ellipse cx="238" cy="222" rx="9" ry="13" fill={strokeColor} />
              <circle cx="241" cy="217" r="3.5" fill="#fff" />
            </g>
          ) : maleEyes === "confident" ? (
            <g>
              <path
                d="M148,214 Q162,207 176,214"
                stroke={strokeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="162" cy="223" rx="8.5" ry="11" fill={strokeColor} />
              <circle cx="165" cy="219" r="3" fill="#fff" />
              <path
                d="M224,214 Q238,207 252,214"
                stroke={strokeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="238" cy="223" rx="8.5" ry="11" fill={strokeColor} />
              <circle cx="241" cy="219" r="3" fill="#fff" />
            </g>
          ) : maleEyes === "happy" ? (
            <g
              stroke={strokeColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <path d="M150,225 Q162,210 174,225" />
              <path d="M226,225 Q238,210 250,225" />
            </g>
          ) : (
            <g>
              <ellipse cx="162" cy="222" rx="9" ry="12" fill={strokeColor} />
              <circle cx="165" cy="218" r="3" fill="#fff" />
              <path
                d="M246,215 L232,223 L246,231"
                stroke={strokeColor}
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          )
        ) : femaleEyes === "sparkle" ? (
          <g>
            <ellipse cx="162" cy="222" rx="11" ry="15" fill={strokeColor} />
            <circle cx="165" cy="216" r="4.5" fill="#fff" />
            <circle cx="158" cy="228" r="2.2" fill="#fff" />
            <ellipse cx="238" cy="222" rx="11" ry="15" fill={strokeColor} />
            <circle cx="241" cy="216" r="4.5" fill="#fff" />
            <circle cx="234" cy="228" r="2.2" fill="#fff" />
          </g>
        ) : femaleEyes === "happy" ? (
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
        ) : femaleEyes === "wink" ? (
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
        ) : femaleEyes === "lashes" ? (
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
          {isMale ? (
            <>
              {maleHairStyle === "quiff" && (
                <g>
                  <path d="M96,206 C94,136 128,50 196,46 C248,44 304,100 304,206 C294,152 262,130 200,128 C144,128 110,154 96,206Z" />
                  <path
                    d="M156,76 Q194,54 238,72"
                    stroke={hairHighlight}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>
              )}
              {maleHairStyle === "side_part" && (
                <g>
                  <path d="M96,208 C94,140 136,60 200,60 C264,60 304,136 304,208 C294,156 260,136 216,134 C164,132 126,156 96,208Z" />
                  <path
                    d="M140,94 Q180,74 230,86"
                    stroke={hairHighlight}
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>
              )}
              {maleHairStyle === "crop" && (
                <g>
                  <path d="M98,210 C96,144 140,68 200,68 C260,68 302,144 302,210 C294,160 266,146 200,144 C142,146 112,160 98,210Z" />
                  <path
                    d="M120,158 Q160,150 200,150 Q240,150 280,158"
                    stroke={adjustColor(hairColor, -0.3)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              )}
              {maleHairStyle === "buzz" && (
                <g>
                  <path d="M98,212 C96,148 142,74 200,74 C258,74 302,148 302,212 C294,166 264,154 200,154 C140,154 112,166 98,212Z" />
                  <path
                    d="M130,162 Q200,154 270,162"
                    stroke={adjustColor(hairColor, -0.2)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                  />
                </g>
              )}
              {maleHairStyle === "wavy_short" && (
                <g>
                  <path d="M96,204 C92,134 132,54 196,54 C256,54 304,130 304,204 C292,148 260,132 202,132 C148,132 114,148 96,204Z" />
                  <path
                    d="M136,84 Q164,68 196,80 Q228,68 256,82"
                    stroke={hairHighlight}
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>
              )}
              {maleHairStyle === "slick" && (
                <g>
                  <path d="M96,206 C94,136 138,58 200,58 C262,58 304,136 304,206 C294,150 258,130 200,130 C142,130 110,150 96,206Z" />
                  <path
                    d="M150,82 Q200,68 250,82"
                    stroke={hairHighlight}
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>
              )}
            </>
          ) : (
            <>
              <path d={FEMALE_BANGS[bangs]} />
              <path
                d="M162,94 Q200,78 238,94"
                stroke={hairHighlight}
                strokeOpacity="0.8"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
        </g>

        {/* Glasses (optional) */}
        {hasGlasses && (
          <g>
            {isMale ? (
              maleGlassesType === "square" ? (
                <g
                  stroke={strokeColor}
                  strokeWidth="4.5"
                  fill="#ffffff"
                  fillOpacity="0.15"
                  strokeLinejoin="round"
                >
                  <rect x="136" y="202" width="52" height="40" rx="6" />
                  <rect x="212" y="202" width="52" height="40" rx="6" />
                  <path d="M188,220 L212,220" fill="none" />
                </g>
              ) : maleGlassesType === "round" ? (
                <g
                  stroke={strokeColor}
                  strokeWidth="4"
                  fill="#ffffff"
                  fillOpacity="0.15"
                  strokeLinejoin="round"
                >
                  <circle cx="162" cy="222" r="23" />
                  <circle cx="238" cy="222" r="23" />
                  <path d="M185,220 Q200,214 215,220" fill="none" />
                </g>
              ) : (
                <g
                  stroke={strokeColor}
                  strokeWidth="3.5"
                  fill="#ffffff"
                  fillOpacity="0.12"
                  strokeLinejoin="round"
                >
                  <rect x="136" y="204" width="50" height="36" rx="6" />
                  <rect x="214" y="204" width="50" height="36" rx="6" />
                  <path d="M186,218 L214,218" fill="none" />
                </g>
              )
            ) : femaleGlassesType === "round" ? (
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
            ) : femaleGlassesType === "square" ? (
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
            ) : (
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
