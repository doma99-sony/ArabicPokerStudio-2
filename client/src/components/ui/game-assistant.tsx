import { useIsMobile } from '@/hooks/use-mobile';

export function GameAssistant() {
  const isMobile = useIsMobile();
  
  return (
    <div className={`assistant-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="assistant-wrapper">
        <img 
          src="/assets/assistant/game-assistant.png" 
          alt="مساعد اللعبة" 
          className="assistant-image" 
        />
      </div>
    </div>
  );
}

// تصدير الأنماط التي يمكن استخدامها عالمياً
export const gameAssistantStyles = `
  .assistant-container {
    position: fixed;
    z-index: 50;
  }
  
  .assistant-container.desktop {
    left: 20px;
    bottom: 20px;
  }
  
  .assistant-container.mobile {
    left: 10px;
    bottom: 70px;
  }
  
  .assistant-button {
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease;
    outline: none;
    position: relative;
  }
  
  .assistant-button:hover {
    transform: scale(1.05);
  }
  
  .assistant-button:active {
    transform: scale(0.95);
  }
  
  .assistant-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .assistant-dialog {
    direction: rtl;
  }
  
  .tip-container {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 640px) {
    .assistant-image {
      width: 60px;
      height: 60px;
    }
  }
`;