import React, { useEffect, useMemo } from "react";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { reaction } from "mobx";
import styled, { createGlobalStyle } from "styled-components";
import { fontFamily } from "@seanchas116/paintkit/src/components/Common";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import { Editor } from "../views/Editor";
import { AppEditorState } from "./AppEditorState";
import { File } from "./File";
import { TabBarArea } from "./TabBarArea";

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
  file: File;
}> = ({ file }) => {
  const editorState = useMemo(() => {
    return new AppEditorState(file);
  }, [file]);

  useEffect(() => {
    return reaction(
      () => editorState.windowTitle,
      (title) => {
        document.title = title;
      },
      { fireImmediately: true }
    );
  }, [editorState]);

  useEffect(() => editorState.listenKeyEvents(window), [editorState]);

  return (
    <>
      <GlobalStyle />
      <PaintkitRoot colorScheme="auto">
        <AppWrap>
          <TabBarArea editorState={editorState} />
          <StyledEditor editorState={editorState} />
        </AppWrap>
      </PaintkitRoot>
    </>
  );
};
