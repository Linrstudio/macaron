import React from "react";
import styled, { css } from "styled-components";
import { ReactSortable } from "react-sortablejs";
//import closeIcon from "@material-icons/svg/svg/close/outline.svg";
import closeIcon from "@iconify-icons/ic/outline-close";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import {
  iconToSVGString,
  svgToDataURL,
} from "@seanchas116/paintkit/src/util/Image";

const closeIconSVG = svgToDataURL(iconToSVGString(closeIcon));

export interface TabItem {
  id: string;
  text: string;
  modified: boolean;
}

export const TabBar: React.VFC<{
  className?: string;
  tabs: TabItem[];
  currentID?: string;
  onTabsChange: (tabs: TabItem[]) => void;
  onCurrentIDChange: (id: string) => void;
  onCloseClick: (id: string) => void;
}> = ({
  className,
  tabs,
  currentID,
  onTabsChange,
  onCurrentIDChange,
  onCloseClick,
}) => {
  return (
    <TabBarSortable
      list={tabs}
      setList={onTabsChange}
      animation={100}
      className={className}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          selected={tab.id === currentID}
          onMouseDown={() => onCurrentIDChange(tab.id)}
        >
          {tab.text}
          <CloseButton
            modified={tab.modified}
            onClick={(e) => {
              e.stopPropagation();
              onCloseClick(tab.id);
            }}
          />
        </Tab>
      ))}
    </TabBarSortable>
  );
};

const CloseButton = styled.button<{ modified: boolean }>`
  width: 16px;
  height: 16px;
  mask-image: url(${closeIconSVG});
  mask-size: 12px;
  mask-repeat: no-repeat;
  mask-position: center;
  color: ${colors.label};
  background: currentColor;
  position: relative;

  ${(p) =>
    p.modified &&
    css`
      :not(:hover) {
        mask-image: none;
        background: none;
        ::before {
          content: "";
          position: absolute;
          left: 4px;
          right: 4px;
          top: 4px;
          bottom: 4px;
          border-radius: 50%;
          background-color: currentColor;
        }
      }
    `}

  :hover {
    transform: scale(1.2);
  }
`;

const Tab = styled.div<{ selected: boolean }>`
  padding: 8px 8px 6px 16px;
  line-height: 16px;
  color: ${colors.label};

  display: flex;
  align-items: center;
  gap: 6px;

  position: relative;

  border-left: 2px solid ${colors.separator};
  border-bottom: 2px solid transparent;

  cursor: pointer;

  :hover {
    color: ${colors.text};
  }

  ${(p) =>
    p.selected &&
    css`
      border-bottom: 2px solid ${colors.active};
      background: ${colors.background};
      color: ${colors.text};
    `}
`;

const TabBarSortable = styled(ReactSortable)`
  display: flex;
  height: 32px;
`;
