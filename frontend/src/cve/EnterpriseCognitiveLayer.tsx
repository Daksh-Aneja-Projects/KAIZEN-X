"use client";

import React, { useEffect, useState } from 'react';
import { cveEngine, CognitiveSnapshot } from './engine';
import { KaizenAdapter } from './adapter';
import { TimelinePlugin } from './plugins/TimelinePlugin';
import { CognitiveStatePlugin } from './plugins/CognitiveStatePlugin';
import { TimeMachine } from './components/TimeMachine';

export default function EnterpriseCognitiveLayer() {
  const [snapshot, setSnapshot] = useState<CognitiveSnapshot>(cveEngine.getCurrentSnapshot());
  const [eventCount, setEventCount] = useState(0);
  const [replayIndex, setReplayIndex] = useState(0);
  const isReplayingRef = React.useRef(false);

  useEffect(() => {
    const adapter = new KaizenAdapter();
    
    // Subscribe to semantic events
    adapter.connect((event) => {
      cveEngine.dispatch(event);
      const events = cveEngine.getEvents();
      setEventCount(events.length);
      
      // Auto-advance if not in replay mode
      if (!isReplayingRef.current) {
        setSnapshot(cveEngine.getCurrentSnapshot());
        setReplayIndex(events.length - 1);
      }
    });

    return () => {
      adapter.disconnect();
    };
  }, []);

  const handleScrub = (index: number) => {
    const events = cveEngine.getEvents();
    if (events.length === 0) return;
    
    isReplayingRef.current = index < events.length - 1;
    setReplayIndex(index);
    
    // Find snapshot corresponding to this event
    const eventTime = events[index].provenance.timestamp;
    const historicalSnapshot = cveEngine.getSnapshotAt(eventTime);
    if (historicalSnapshot) {
      setSnapshot(historicalSnapshot);
    }
  };

  return (
    <div className="flex flex-col border-b border-[var(--color-border-subtle)] bg-[var(--color-background)] shadow-sm shrink-0">
      {/* Plugin Rendering Zone */}
      <div className="flex flex-col">
        {TimelinePlugin.render(snapshot)}
        {CognitiveStatePlugin.render(snapshot)}
      </div>

      {/* Replay Controls */}
      <TimeMachine 
        eventCount={eventCount} 
        currentIndex={replayIndex} 
        onScrub={handleScrub} 
      />
    </div>
  );
}
