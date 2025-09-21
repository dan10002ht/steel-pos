import React from "react";
import Timeline from "@/components/atoms/Timeline";
import TimelineItem from "@/components/atoms/TimelineItem";

const LogTimeline = ({ 
  logs = [], 
  showDetailedLog = false,
  onCompareChanges,
  onToggleExpansion,
  expandedLogs = {}
}) => {
  const renderLogItem = (log) => (
    <TimelineItem
      log={log}
      isExpanded={expandedLogs[log.id] || false}
      onCompareChanges={onCompareChanges}
      onToggleExpansion={onToggleExpansion}
      showDetailedLog={showDetailedLog}
    />
  );

  return (
    <Timeline
      items={logs}
      groupBy="date"
      renderItem={renderLogItem}
      emptyMessage="Chưa có lịch sử thay đổi nào"
      showVerticalLine={true}
    />
  );
};

export default LogTimeline;
