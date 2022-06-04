import { colors } from "@seanchas116/paintkit/src/components/Palette";
import React, { useState } from "react";
import styled from "styled-components";
import menuIcon from "@iconify-icons/ic/outline-menu";
import { Dropdown } from "@seanchas116/paintkit/src/components/menu/Dropdown";
import { ToolButton } from "@seanchas116/paintkit/src/components/toolbar/ToolButton";
import { EditorState } from "../state/EditorState";
import { TabBar } from "./TabBar";

const TabBarWrap = styled.div`
  height: 32px;
  background-color: #181818;
  display: flex;
  font-size: 12px;
`;

const MenuArea = styled.div`
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid ${colors.separator};
`;

export const TabBarArea: React.FC<{ editorState: EditorState }> = ({
  editorState,
}) => {
  const [tabs, setTabs] = useState([
    { id: "1", text: "Tab 1", modified: false },
    { id: "2", text: "Tab 2", modified: true },
    { id: "3", text: "Tab 3", modified: false },
  ]);

  const [currentID, setCurrentID] = useState("1");

  return (
    <TabBarWrap>
      <MenuArea>
        <Dropdown
          options={editorState.getMainMenu()}
          button={(open, onClick) => (
            <ToolButton
              label="Menu"
              icon={menuIcon}
              selected={open}
              onClick={(_, elem) => onClick(elem)}
            />
          )}
        />
      </MenuArea>

      <TabBar
        tabs={tabs}
        currentID={currentID}
        onTabsChange={(tabs) => {
          console.log(tabs);
          setTabs(tabs);
        }}
        onCurrentIDChange={setCurrentID}
        onCloseClick={(key) => {
          console.log("close", key);
        }}
      />
    </TabBarWrap>
  );
};
