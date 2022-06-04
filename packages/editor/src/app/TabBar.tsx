import { colors } from "@seanchas116/paintkit/src/components/Palette";
import React from "react";
import styled from "styled-components";

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

export const TabBar: React.FC = () => {
  return (
    <TabBarWrap>
      <Tab aria-selected>File1.macaron</Tab>
      <Tab>File2.macaron</Tab>
      <Tab>File3.macaron</Tab>
    </TabBarWrap>
  );
};
