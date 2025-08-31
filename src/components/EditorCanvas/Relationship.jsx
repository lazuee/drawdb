import { useMemo, useRef, useState, useEffect } from "react";
import { Cardinality, ObjectType, Tab } from "../../data/constants";
import { calcPath } from "../../utils/calcPath";
import { useDiagram, useSettings, useLayout, useSelect } from "../../hooks";
import { useTranslation } from "react-i18next";
import { SideSheet } from "@douyinfe/semi-ui";
import RelationshipInfo from "../EditorSidePanel/RelationshipsTab/RelationshipInfo";

// const labelFontSize = 16;

export default function Relationship({ data }) {
  const [editing, setEditing] = useState(false);
  const { settings } = useSettings();
  const { tables } = useDiagram();
  const { layout } = useLayout();
  const { selectedElement, setSelectedElement } = useSelect();
  const { t } = useTranslation();

  const pathValues = useMemo(() => {
    const startTable = tables.find((t) => t.id === data.startTableId);
    const endTable = tables.find((t) => t.id === data.endTableId);

    if (!startTable || !endTable) return null;

    return {
      startFieldIndex: startTable.fields.findIndex(
        (f) => f.id === data.startFieldId,
      ),
      endFieldIndex: endTable.fields.findIndex((f) => f.id === data.endFieldId),
      startTable: { x: startTable.x, y: startTable.y },
      endTable: { x: endTable.x, y: endTable.y },
    };
  }, [tables, data]);

  useEffect(() => {
    setEditing(data.id === selectedElement.id);
  }, [data.id, selectedElement.id]);

  const pathRef = useRef();
  // const labelRef = useRef();

  let cardinalityStart = "1";
  let cardinalityEnd = "1";

  switch (data.cardinality) {
    // the translated values are to ensure backwards compatibility
    case t(Cardinality.MANY_TO_ONE):
    case Cardinality.MANY_TO_ONE:
      cardinalityStart = data.manyLabel || "n";
      cardinalityEnd = "1";
      break;
    case t(Cardinality.ONE_TO_MANY):
    case Cardinality.ONE_TO_MANY:
      cardinalityStart = "1";
      cardinalityEnd = data.manyLabel || "n";
      break;
    case t(Cardinality.ONE_TO_ONE):
    case Cardinality.ONE_TO_ONE:
      cardinalityStart = "1";
      cardinalityEnd = "1";
      break;
    default:
      break;
  }

  let cardinalityStartX = 0;
  let cardinalityEndX = 0;
  let cardinalityStartY = 0;
  let cardinalityEndY = 0;

  let directionStart = 1;
  let directionEnd = 1;

  // let labelX = 0;
  // let labelY = 0;

  // let labelWidth = labelRef.current?.getBBox().width ?? 0;
  // let labelHeight = labelRef.current?.getBBox().height ?? 0;

  const cardinalityOffset = 0;

  if (pathRef.current) {
    const pathLength = pathRef.current.getTotalLength();

    // const labelPoint = pathRef.current.getPointAtLength(pathLength / 2);
    // labelX = labelPoint.x - (labelWidth ?? 0) / 2;
    // labelY = labelPoint.y + (labelHeight ?? 0) / 2;

    const point1 = pathRef.current.getPointAtLength(cardinalityOffset);
    cardinalityStartX = point1.x;
    cardinalityStartY = point1.y;

    const point1Ahead = pathRef.current.getPointAtLength(cardinalityOffset + 1);
    directionStart = point1Ahead.x < point1.x ? -1 : 1;

    const point2 = pathRef.current.getPointAtLength(pathLength - cardinalityOffset);
    cardinalityEndX = point2.x;
    cardinalityEndY = point2.y;

    const point2Behind = pathRef.current.getPointAtLength(pathLength - cardinalityOffset - 1);
    directionEnd = point2Behind.x < point2.x ? -1 : 1;
  }

  const edit = () => {
    setEditing(true);
    if (!layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.RELATIONSHIP,
        id: data.id,
        open: true,
      }));
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        currentTab: Tab.RELATIONSHIPS,
        element: ObjectType.RELATIONSHIP,
        id: data.id,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.RELATIONSHIPS) return;
      document
        .getElementById(`scroll_ref_${data.id}`)
        .scrollIntoView({ behavior: "smooth" });
    }
  };

  const editingPathClass = ["group-hover:stroke-sky-700", editing && "stroke-sky-700"].filter(Boolean).join(" ");
  // const editingCircleClass = ["group-hover:fill-sky-700", editing && "fill-sky-700"].filter(Boolean).join(" ");

  return (
    <>
      <g className="select-none group cursor-pointer" onDoubleClick={edit}>
        <path
          ref={pathRef}
          d={calcPath(pathValues, settings.tableWidth, settings.curveRadius)}
          stroke={settings.mode === "light"
            ? "black"
            : "gray"
          }
          className={editingPathClass}
          fill="none"
          strokeWidth={3}
          cursor="pointer"
        />
        {pathRef.current && settings.showCardinality && (
          <>
            <CardinalitySymbol
              x={cardinalityStartX}
              y={cardinalityStartY}
              direction={directionStart}
              value={cardinalityStart}
              className={editingPathClass}
              settings={settings}
            />
            <CardinalitySymbol
              x={cardinalityEndX}
              y={cardinalityEndY}
              direction={directionEnd}
              value={cardinalityEnd}
              className={editingPathClass}
              settings={settings}
            />
          </>
          // <>
          //   <CardinalityLabel
          //     x={cardinalityStartX}
          //     y={cardinalityStartY}
          //     text={cardinalityStart}
          //     className={editingCircleClass}
          //   />
          //   <CardinalityLabel
          //     x={cardinalityEndX}
          //     y={cardinalityEndY}
          //     text={cardinalityEnd}
          //     className={editingCircleClass}
          //   />
          // </>
        )}
      </g>
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          selectedElement.element === ObjectType.RELATIONSHIP &&
          selectedElement.id === data.id &&
          selectedElement.open &&
          !layout.sidebar
        }
        onCancel={() => {
          setSelectedElement((prev) => ({
            ...prev,
            open: false,
          }));
        }}
        style={{ paddingBottom: "16px" }}
      >
        <div className="sidesheet-theme">
          <RelationshipInfo data={data} />
        </div>
      </SideSheet>
    </>
  );
}

function CardinalitySymbol({ x, y, direction, value, className, settings }) {
  const isOne = value === "1";
  const isMany = value !== "1";

  const color = settings.mode === "light"
    ? "black"
    : "gray"

  const oneColor = isOne ? color : "none";
  const manyColor = isMany ? color : "none";

  return (
    <g transform={`translate(${direction == 1 ? x + 1 : x - 23},${y})`}>
      {direction === 1 ? (
        <>
          <line
            x1="23"
            y1="-10"
            x2="23"
            y2="10"
            className={isOne ? className : ""}
            stroke={oneColor}
            strokeWidth="2"
          />
          <path
            d="M0 -10 L23 0 L0 10"
            className={isMany ? className : ""}
            stroke={manyColor}
            strokeWidth="2"
            fill="none"
          />
        </>
      ) : (
        <>
          <line
            x1="0"
            y1="-10"
            x2="0"
            y2="10"
            className={isOne ? className : ""}
            stroke={oneColor}
            strokeWidth="2"
          />
          <path
            d="M23 -10 L0 0 L23 10"
            className={isMany ? className : ""}
            stroke={manyColor}
            strokeWidth="2"
            fill="none"
          />
        </>
      )}
    </g>
  );
}

// function CardinalityLabel({ x, y, text, r = 12, padding = 14, className = "" }) {
//   const [textWidth, setTextWidth] = useState(0);
//   const textRef = useRef(null);

//   useEffect(() => {
//     if (textRef.current) {
//       const bbox = textRef.current.getBBox();
//       setTextWidth(bbox.width);
//     }
//   }, [text]);

//   return (
//     <g>
//       <rect
//         x={x - textWidth / 2 - padding / 2}
//         y={y - r}
//         rx={r}
//         ry={r}
//         width={textWidth + padding}
//         height={r * 2}
//         fill="grey"
//         className={className}
//       />
//       <text
//         ref={textRef}
//         x={x}
//         y={y}
//         fill="white"
//         strokeWidth="0.5"
//         textAnchor="middle"
//         alignmentBaseline="middle"
//       >
//         {text}
//       </text>
//     </g>
//   );
// }
