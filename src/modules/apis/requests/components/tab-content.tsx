"use client";

import { TabsContent } from "@/components/ui/tabs";
import useRequestSyncStoreState from "../hooks/requestSyncStore";
import ApiRequestComponent from "./ApiRequestComponent";
import NewRequestTabContent from "./new-request-tab";
import SocketIORequestComponent from "./SocketIORequestComponent";
import WebsocketRequestComponent from "./WebsocketRequestComponent";

const TabContent = ({ id }: { id: string }) => {
  const { activeRequest } = useRequestSyncStoreState();
  return (
    <TabsContent
      value={id}
      className="flex-1 flex h-full w-full !bg-background items-center justify-center overflow-hidden p-0"
    >
      {activeRequest?.type === "NEW" && <NewRequestTabContent />}
      {activeRequest?.type === "API" && <ApiRequestComponent />}
      {activeRequest?.type === "SOCKET_IO" && <SocketIORequestComponent />}
      {activeRequest?.type === "WEBSOCKET" && <WebsocketRequestComponent />}
    </TabsContent>
  );
};

export default TabContent;
