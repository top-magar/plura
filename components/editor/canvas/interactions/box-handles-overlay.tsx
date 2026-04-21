'use client';

import type { ReactNode } from 'react';
import type { El } from '../../core/types';
import { parseBox, useHandles, BoxZone, BoxHandle, RadiusCorners } from '../handles/index';
import type { useEditor } from '../../core/provider';

export function BoxHandlesOverlay({ element, isSel, isHov, dispatch }: {
  element: El; isSel: boolean; isHov: boolean; dispatch: ReturnType<typeof useEditor>['dispatch'];
}): ReactNode {
  const h = useHandles(dispatch);
  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s, 'padding');
  const [mt, mr, mb, ml] = parseBox(s, 'margin');
  const hasPad = pt > 0 || pr > 0 || pb > 0 || pl > 0;
  const hasMar = mt > 0 || mr > 0 || mb > 0 || ml > 0;

  return (
    <>
      {/* Hover: padding peek */}
      {!element.locked && isHov && hasPad && (
        <>
          {pt > 0 && <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />}
          {pr > 0 && <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />}
          {pb > 0 && <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />}
          {pl > 0 && <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />}
        </>
      )}

      {/* Selected: interactive handles */}
      {isSel && !element.locked && (<>
        {hasPad && (<>
          <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />
          <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />
          <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />
          <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />
          <BoxHandle element={element} id="p-T" prop="paddingTop" val={pt} dir="y" sign={-1} color="emerald" style={{ top: 0, left: 0, right: 0, height: Math.max(pt, 6) }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-R" prop="paddingRight" val={pr} dir="x" sign={1} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: Math.max(pr, 6) }} cls="cursor-ew-resize" h={h} />
          <BoxHandle element={element} id="p-B" prop="paddingBottom" val={pb} dir="y" sign={1} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: Math.max(pb, 6) }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-L" prop="paddingLeft" val={pl} dir="x" sign={-1} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: Math.max(pl, 6) }} cls="cursor-ew-resize" h={h} />
        </>)}
        {hasMar && (<>
          {mt > 0 && <><BoxZone id="m-T" val={mt} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} h={h} /><BoxHandle element={element} id="m-T" prop="marginTop" val={mt} dir="y" sign={-1} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} cls="cursor-ns-resize" h={h} /></>}
          {mr > 0 && <><BoxZone id="m-R" val={mr} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} h={h} /><BoxHandle element={element} id="m-R" prop="marginRight" val={mr} dir="x" sign={1} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} cls="cursor-ew-resize" h={h} /></>}
          {mb > 0 && <><BoxZone id="m-B" val={mb} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} h={h} /><BoxHandle element={element} id="m-B" prop="marginBottom" val={mb} dir="y" sign={1} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} cls="cursor-ns-resize" h={h} /></>}
          {ml > 0 && <><BoxZone id="m-L" val={ml} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} h={h} /><BoxHandle element={element} id="m-L" prop="marginLeft" val={ml} dir="x" sign={-1} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} cls="cursor-ew-resize" h={h} /></>}
        </>)}
        <RadiusCorners element={element} h={h} />
      </>)}
    </>
  );
}
