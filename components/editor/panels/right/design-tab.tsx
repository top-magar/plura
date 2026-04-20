"use client";

import type { El } from "../../core/types";
import type { StyleProps } from "./shared";
import { LayerMenu, MeasuresMenu, RadiusMenu, FillMenu, StrokeMenu, ShadowMenu, BlurMenu, TypographyMenu, LayoutMenu } from "./menus";

// ─── Shape type sets (Penpot pattern: each shape composes its menus) ─

const textTypes = new Set(["text","heading","subheading","quote","code","list","badge","icon","footer","button","link","navbar"]);
const simpleTypes = new Set(["divider","spacer"]);

// ─── Design Tab (Penpot: shape → menu composition) ──────

export default function DesignTab({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const type = selected.type;
  const isSimple = simpleTypes.has(type);
  const isBody = type === "__body";
  const isText = textTypes.has(type);

  // Penpot pattern: compose menus based on shape type
  // frame.cljs → [layer, measures, layout, fill, stroke, shadow, blur, exports]
  // rect.cljs  → [layer, measures, fill, stroke, shadow, blur]
  // text.cljs  → [layer, measures, typography, fill, stroke, shadow, blur]

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Layer (opacity + blend) — all except simple */}
      {!isSimple && <LayerMenu get={get} set={set} />}

      {/* Measures (W, H, sizing mode) — all except simple */}
      {!isSimple && <MeasuresMenu get={get} set={set} />}

      {/* Radius — non-body, non-simple */}
      {!isSimple && !isBody && <RadiusMenu get={get} set={set} />}

      {/* Layout (flex/grid) — non-simple */}
      {!isSimple && <LayoutMenu get={get} set={set} selected={selected} onUpdate={onUpdate} />}

      {/* Typography — text-like elements */}
      {isText && <TypographyMenu get={get} set={set} />}

      {/* Fill — all except simple */}
      {!isSimple && <FillMenu get={get} set={set} />}

      {/* Stroke — non-body, non-simple */}
      {!isSimple && !isBody && <StrokeMenu get={get} set={set} />}

      {/* Shadow — non-body, non-simple */}
      {!isSimple && !isBody && <ShadowMenu get={get} set={set} />}

      {/* Blur — non-body, non-simple */}
      {!isSimple && !isBody && <BlurMenu get={get} set={set} />}
    </div>
  );
}
