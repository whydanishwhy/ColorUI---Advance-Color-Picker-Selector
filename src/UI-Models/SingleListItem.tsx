import React, { useState, useEffect, ReactNode } from 'react';

// --- Types ---
interface SingleListItemProps {
  title: string;
  icon?: ReactNode;
  Element?: React.ComponentType<any>;
  elementProps?: Record<string, any>;
  isFocused: boolean;
  isHidden: boolean;
  onClick: () => void;
}

// --- SingleListItem Component ---
const SingleListItem: React.FC<SingleListItemProps> = ({
  title,
  icon,
  Element,
  elementProps = {},
  isFocused,
  isHidden,
  onClick,
}) => {
  // ✅ LAZY MOUNT: track whether this item has ever been opened.
  // - On initial render: hasBeenOpened = false → Element is NOT mounted (no trigger storm).
  // - First time isFocused becomes true → hasBeenOpened = true → Element mounts.
  // - After that: Element stays mounted forever, just toggled with display:none.
  // This prevents all 11 panels from mounting simultaneously when VisualEditor mounts.
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  
  useEffect(() => {
    if (isFocused && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [isFocused]);



  return (
    <div
      className={`single-list-item ${isFocused ? 'focused' : ''}`}
      style={{ display: isHidden ? 'none' : 'block' }}
    >
      <div
        className="header-row"
        style={{ borderBottom: isFocused ? '1px solid #2a2a2a' : 'none' }}
        onClick={onClick}
      >
        <div className="left">
          {icon && <span>{icon}</span>}
          <span
            style={{
              color: 'white',
              fontWeight: 500,
              fontSize: '16px',
            }}
          >
            {title}
          </span>
        </div>
        <div className="arrow">{isFocused ? '▲' : '▼'}</div>
      </div>

      {/*
        Only render Element after it has been opened at least once.
        Once mounted, keep it in the DOM forever — just hide it.
        This gives us:
          - No unnecessary mounts on load
          - No remounts on close/reopen (drag stays working)
      */}
      {Element && isFocused && (
        <div className="content">
          <Element {...elementProps} />
        </div>
      )}

      <style>{`
        .single-list-item {
          border-bottom: 1px solid #2a2a2a;
          background-color: #121212;
          transition: all 0.2s ease;
          transform: translateY(0);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .single-list-item:not(.focused):hover {
          background-color: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .single-list-item.focused {
          background-color: #1a1a1a80;
          transform: translateY(0);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .header-row {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 16px;
          color: gray;
          font-weight: 500;
        }

        .arrow {
          color: gray;
        }
      `}</style>
    </div>
  );
};

// --- List Data Type ---
export interface ListData {
  title: string;
  icon?: ReactNode;
  Element?: React.ComponentType<any>;
  elementProps?: Record<string, any>;
  tags?: string[];}

// --- SingleFocusLists Component ---
interface SingleFocusListsProps {
  initialLists: ListData[];
}

export const SingleFocusLists: React.FC<SingleFocusListsProps> = ({ initialLists }) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setFocusedIndex(prev => prev === index ? null : index);
  };

  const containerStyle: React.CSSProperties = {
    width: '350px',
    maxHeight: '300px',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  };

  const listsStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={listsStyle} className="hide-scrollbar">
        {initialLists.map((list, index) => {
          const isFocused = focusedIndex === index;
          const isHidden = focusedIndex !== null && !isFocused;

          return (
            <SingleListItem
              key={index}
              title={list.title}
              icon={list.icon}
              Element={list.Element}
              elementProps={list.elementProps}
              isFocused={isFocused}
              isHidden={isHidden}
              onClick={() => handleClick(index)}
            />
          );
        })}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};