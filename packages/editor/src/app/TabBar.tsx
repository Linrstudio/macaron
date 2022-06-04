import {
  IconButton,
  PlusButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import React from "react";
import styled from "styled-components";
import menuIcon from "@iconify-icons/ic/outline-menu";
import { Dropdown } from "@seanchas116/paintkit/src/components/menu/Dropdown";
import { ToolButton } from "@seanchas116/paintkit/src/components/toolbar/ToolButton";
import { useEditorState } from "../views/useEditorState";
import { EditorState } from "../state/EditorState";

const Tab = styled.div`
  color: ${colors.label};
  font-weight: 500;
  height: 32px;
  line-height: 32px;
  padding: 0 20px;

  border-right: 2px solid ${colors.separator};

  &[aria-selected="true"] {
    color: ${colors.text};
    border-bottom: 2px solid ${colors.active};
  }
`;

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

export const TabBar: React.FC<{ editorState: EditorState }> = ({
  editorState,
}) => {
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
      <Tab aria-selected>File1.macaron</Tab>
      <Tab>File2.macaron</Tab>
      <Tab>File3.macaron</Tab>
    </TabBarWrap>
  );
};
