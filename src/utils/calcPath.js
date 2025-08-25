import { tableFieldHeight, tableHeaderHeight } from "../data/constants";

/**
 * Generates an SVG path string to visually represent a relationship between two fields.
 *
 * @param {{
 *   startTable: { x: number, y: number },
 *   endTable: { x: number, y: number },
 *   startFieldIndex: number,
 *   endFieldIndex: number
 * }} r - Relationship data.
 * @param {number} tableWidth - Width of each table (used to calculate horizontal offsets).
 * @param {number} zoom - Zoom level (used to scale vertical spacing).
 * @returns {string} SVG path "d" attribute string.
 */
export function calcPath(r, tableWidth = 200, zoom = 1) {
  if (!r) {
    return "";
  }

  const width = tableWidth * zoom;
  let x1 = r.startTable.x;
  let y1 =
    r.startTable.y +
    r.startFieldIndex * tableFieldHeight +
    tableHeaderHeight +
    tableFieldHeight / 2;
  let x2 = r.endTable.x;
  let y2 =
    r.endTable.y +
    r.endFieldIndex * tableFieldHeight +
    tableHeaderHeight +
    tableFieldHeight / 2;

  let radius = 10 * zoom;

  const minRadius = 17 * zoom;
  const midX = (x2 + x1 + width) / 2;
  const endX = x2 + width < x1 ? x2 + width : x2;

  if (Math.abs(y1 - y2) <= 36 * zoom) {
    radius = Math.max(Math.abs(y2 - y1) / 3, minRadius);
    if (radius <= minRadius) {
      if (x1 + width <= x2) return `M ${x1 + width} ${y1} L ${x2} ${y2}`;
      else if (x2 + width < x1) return `M ${x1} ${y1} L ${x2 + width} ${y2}`;
    }
  } else {
    radius = Math.max(radius, minRadius);
  }

  const startRight = x1 + width;
  const startLeft = x1;
  const endRight = x2 + width;
  const endLeft = x2;

  // top = use y above center; bottom = use y below center
  const halfField = tableFieldHeight / 2;
  const startTopY = y1 - halfField;
  const startBottomY = y1 + halfField;
  const endTopY = y2 - halfField;
  const endBottomY = y2 + halfField;

  const useTop = y1 <= y2; // start is above end -> use "top" y
  const sY = useTop ? startTopY : startBottomY;
  const eY = useTop ? endTopY : endBottomY;

  if (useTop) {
    if (startRight <= endLeft) {
      return `M ${startRight} ${sY} L ${midX - radius} ${sY}
        A ${radius} ${radius} 0 0 1 ${midX} ${sY + radius}
        L ${midX} ${eY - radius}
        A ${radius} ${radius} 0 0 0 ${midX + radius} ${eY}
        L ${endX} ${eY}`;
    } else if (endLeft >= startLeft && startLeft <= endLeft) {
      return `M ${startRight} ${sY} L ${endRight} ${sY}
      A ${radius} ${radius} 0 0 1 ${endRight + radius} ${sY + radius}
      L ${endRight + radius} ${eY - radius}
      A ${radius} ${radius} 0 0 1 ${endRight} ${eY}
      L ${endRight} ${eY}`;
    } else if (endRight >= startLeft && endRight <= startRight) {
      return `M ${startLeft} ${sY} L ${endLeft - radius} ${sY}
      A ${radius} ${radius} 0 0 0 ${endLeft - radius * 2} ${sY + radius}
      L ${endLeft - radius * 2} ${eY - radius}
      A ${radius} ${radius} 0 0 0 ${endLeft - radius} ${eY}
      L ${endLeft} ${eY}`;
    } else {
      return `M ${startLeft} ${sY} L ${midX + radius} ${sY}
        A ${radius} ${radius} 0 0 0 ${midX} ${sY + radius}
        L ${midX} ${eY - radius}
        A ${radius} ${radius} 0 0 1 ${midX - radius} ${eY}
        L ${endX} ${eY}`;
    }
  } else {
    if (startRight <= endLeft) {
      return `M ${startRight} ${sY} L ${midX - radius} ${sY}
        A ${radius} ${radius} 0 0 0 ${midX} ${sY - radius}
        L ${midX} ${eY + radius}
        A ${radius} ${radius} 0 0 1 ${midX + radius} ${eY}
        L ${endX} ${eY}`;
    } else if (startRight >= endLeft && startRight <= endRight) {
      return `M ${startLeft} ${sY} L ${startLeft - radius * 2} ${sY}
      A ${radius} ${radius} 0 0 1 ${startLeft - radius * 3} ${sY - radius}
      L ${startLeft - radius * 3} ${eY + radius}
      A ${radius} ${radius} 0 0 1 ${startLeft - radius * 2} ${eY}
        L ${endX} ${eY}`;
    } else if (startLeft >= endLeft && startLeft <= endRight) {
      return `M ${startRight} ${sY} L ${startRight + radius} ${sY}
      A ${radius} ${radius} 0 0 0 ${startRight + radius * 2} ${sY - radius}
      L ${startRight + radius * 2} ${eY + radius}
      A ${radius} ${radius} 0 0 0 ${startRight + radius} ${eY}
      L ${endRight} ${eY}`;
    } else {
      return `M ${startLeft} ${sY} L ${midX + radius} ${sY}
        A ${radius} ${radius} 0 0 1 ${midX} ${sY - radius}
        L ${midX} ${eY + radius}
        A ${radius} ${radius} 0 0 0 ${midX - radius} ${eY}
        L ${endX} ${eY}`;
    }
  }
}
