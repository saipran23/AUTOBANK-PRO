import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatHeader = ({
                        currentAgent,
                        isConnected,
                        onEscalateToHuman,
                        onEndChat,
                        sessionId,
                        waitTime
                    }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-border bg-card relative">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentAgent?.type === 'human' ? 'bg-success' : 'bg-primary'
                }`}>
                    {currentAgent?.type === 'human' ? (
                        <Icon name="Headphones" size={20} color="white" />
                    ) : (
                        <Icon name="Bot" size={20} color="white" />
                    )}
                </div>

                <div>
                    <h2 className="font-semibold text-foreground">
                        {currentAgent?.name || 'AutoBank Assistant'}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-success animate-pulse' : 'bg-error'
                        }`}></div>
                        <span className="text-sm text-muted-foreground">
              {isConnected ? (
                  currentAgent?.type === 'human' ? 'Live Agent' : 'Online' ) :'Connecting...'}
            </span>
                        {waitTime && (
                            <span className="text-xs text-warning">
                • Wait time: {waitTime}
              </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {currentAgent?.type !== 'human' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEscalateToHuman}
                        className="hidden sm:flex"
                    >
                        <Icon name="User" size={16} className="mr-2" />
                        Talk to Human
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEndChat}
                    className="text-error hover:text-error hover:bg-error/10"
                    title="End chat"
                >
                    <Icon name="X" size={16} />
                </Button>
            </div>

            {sessionId && (
                <div className="absolute top-full left-4 text-xs text-muted-foreground bg-card px-2 py-1 rounded-b border-x border-b border-border">
                    Session: {sessionId}
                </div>
            )}
        </div>
    );
};

export default ChatHeader;
