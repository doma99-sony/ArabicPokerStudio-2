import { motion } from "framer-motion";
import { Card as CardType } from "@/types";
import { CardComponent } from "./card-component";

interface CommunityCardsProps {
  cards: CardType[];
  size?: "sm" | "md" | "lg";
}

export function CommunityCards({ cards, size = "md" }: CommunityCardsProps) {
  // تحديد عرض البطاقة حسب الحجم المطلوب
  const cardWidth = size === "sm" ? 40 : size === "md" ? 60 : 80;
  
  // تحديد البعد بين البطاقات
  const cardGap = size === "sm" ? -5 : size === "md" ? -10 : -15;
  
  // تأثيرات الحركة للبطاقات المجتمعية
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const cardVariants = {
    hidden: {
      y: -50,
      opacity: 0,
      rotateY: 180,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  // تحويل حجم الورقة إلى التنسيق المطلوب للمكون الجديد
  const cardSize = size === "sm" ? "sm" : size === "md" ? "md" : "lg";

  return (
    <motion.div
      className="flex justify-center items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* عرض الأوراق المجتمعية */}
      <div className="flex">
        {cards.map((card, index) => (
          <motion.div
            key={`community-card-${index}`}
            className="relative"
            style={{
              marginLeft: index > 0 ? `${cardGap}px` : "0px",
              zIndex: 10 + index,
            }}
            variants={cardVariants}
          >
            <CardComponent
              card={card}
              size={cardSize}
              variant="gold"
              isWinning={card.isWinning}
            />
          </motion.div>
        ))}
        
        {/* إذا كان عدد البطاقات أقل من 5، أضف مواقع للبطاقات المخفية */}
        {Array.from({ length: Math.max(0, 5 - cards.length) }).map((_, index) => (
          <div
            key={`empty-card-${index}`}
            className="relative"
            style={{
              width: `${cardWidth}px`,
              height: `${cardWidth * 1.4}px`,
              marginLeft: cards.length > 0 || index > 0 ? `${cardGap}px` : "0px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              border: "1px dashed rgba(255, 255, 255, 0.3)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}