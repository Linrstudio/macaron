import { colors } from "@seanchas116/paintkit/src/components/Palette";
import React from "react";
import styled from "styled-components";
import menuIcon from "@iconify-icons/ic/outline-menu";
import { Dropdown } from "@seanchas116/paintkit/src/components/menu/Dropdown";
import { ToolButton } from "@seanchas116/paintkit/src/components/toolbar/ToolButton";
import { compact } from "lodash-es";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { TabBar } from "./TabBar";
import { AppState } from "./AppState";
import { File } from "./File";

const TabBarWrap = styled.div`
  height: 32px;
  background-color: #1d1d1d;
  display: flex;
  font-size: 12px;

  > *:last-child {
    flex: 1;
  }
`;

const MenuArea = styled.div`
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid ${colors.separator};
`;

export const TabBarArea: React.FC<{ appState: AppState }> = observer(
  ({ appState }) => {
    const fileList = appState.fileList;

    const tabs = fileList.files.map((file) => {
      return {
        id: file.key,
        text: file.fileName,
        modified: file.history.isModified,
      };
    });

    const currentID = fileList.currentFile?.key;

    return (
      <TabBarWrap>
        <MenuArea>
          <Dropdown
            options={appState.getMenu()}
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
          onTabsChange={action((tabs) => {
            console.log(tabs);

            const fileMap = new Map<string, File>();
            for (const file of fileList.files) {
              fileMap.set(file.key, file);
            }

            const newFiles = compact(tabs.map((tab) => fileMap.get(tab.id)));
            fileList.setFiles(newFiles);
          })}
          onCurrentIDChange={action((key) => {
            const file = fileList.files.find((file) => file.key === key);
            fileList.setCurrentFile(file);
          })}
          onCloseClick={(key) => {
            // TODO
            console.log("close", key);
          }}
        />
      </TabBarWrap>
    );
  }
);
