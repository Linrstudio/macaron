import React, { useEffect, useMemo } from "react";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import styled, { createGlobalStyle } from "styled-components";
import { fontFamily } from "@seanchas116/paintkit/src/components/Common";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import { Editor } from "../views/Editor";
import { TabBarArea } from "./TabBarArea";
import { AppState } from "./AppState";
import { FileList } from "./FileList";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    overflow: hidden;
    overscroll-behavior-x: none;
    font-family: ${fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .tippy-content {
    font-size: 12px;
  }
`;

const StyledEditor = styled(Editor)`
  border-top: 2px solid ${colors.separator};
`;

const AppWrap = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${colors.background};

  > :last-child {
    flex: 1;
  }
`;

export const App: React.FC<{
  fileList: FileList;
}> = observer(({ fileList }) => {
  const appState = useMemo(() => {
    return new AppState(fileList);
  }, [fileList]);

  // useEffect(() => editorState.listenKeyEvents(window), [editorState]);

  const editorState = appState.currentEditorState;

  useEffect(() => {
    const onWindowKeyDown = action((e: KeyboardEvent) => {
      if (appState.handleGlobalKeyDown(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const onWindowKeyUp = action((e: KeyboardEvent) => {
      appState.handleGlobalKeyUp(e);
    });

    window.addEventListener("keydown", onWindowKeyDown, { capture: true });
    window.addEventListener("keyup", onWindowKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown, {
        capture: true,
      });
      window.removeEventListener("keyup", onWindowKeyUp, { capture: true });
    };
  });

  return (
    <>
      <GlobalStyle />
      <PaintkitRoot colorScheme="auto">
        <AppWrap>
          <TabBarArea appState={appState} />
          {editorState ? <StyledEditor editorState={editorState} /> : <div />}
        </AppWrap>
      </PaintkitRoot>
    </>
  );
});
