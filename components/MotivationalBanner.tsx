import React from 'react';
import { Flame, Zap, Target, Calendar, TrendingUp } from 'lucide-react';

interface MotivationalBannerProps {
  daysRemaining?: number;
  examType?: string;
}

const MotivationalBanner: React.FC<MotivationalBannerProps> = ({ daysRemaining, examType }) => {
  if (!daysRemaining) return null;

  const getMotivation = () => {
    if (daysRemaining === 0) {
      return {
        icon: <Flame className="w-6 h-6" />,
        title: "EXAM DAY IS HERE!",
        message: "Stay calm, trust your preparation. You've got this! 💪",
        color: "from-red-500 to-orange-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      };
    }
    
    if (daysRemaining === 1) {
      return {
        icon: <Flame className="w-6 h-6" />,
        title: "FINAL DAY!",
        message: "Quick revision only. Rest well tonight. Tomorrow is your day! 🎯",
        color: "from-red-500 to-orange-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      };
    }
    
    if (daysRemaining <= 7) {
      return {
        icon: <Flame className="w-6 h-6" />,
        title: `${daysRemaining} DAYS LEFT!`,
        message: "Crunch time! Focus on weak areas and quick revisions. Every hour counts! 🔥",
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30"
      };
    }
    
    if (daysRemaining <= 30) {
      return {
        icon: <Zap className="w-6 h-6" />,
        title: `${daysRemaining} Days to Go`,
        message: "Final sprint! Practice mock tests daily. Build exam temperament. ⚡",
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30"
      };
    }
    
    if (daysRemaining <= 90) {
      return {
        icon: <Target className="w-6 h-6" />,
        title: `${daysRemaining} Days Remaining`,
        message: "Perfect time for intensive practice. Cover all topics systematically. 📚",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30"
      };
    }
    
    if (daysRemaining <= 180) {
      return {
        icon: <TrendingUp className="w-6 h-6" />,
        title: `${daysRemaining} Days to Prepare`,
        message: "Great! You have good time. Build strong fundamentals now. 💪",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30"
      };
    }
    
    return {
      icon: <Calendar className="w-6 h-6" />,
      title: `${daysRemaining} Days Ahead`,
      message: "Excellent! Start with basics and build gradually. Consistency is key! ✨",
      color: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    };
  };

  const motivation = getMotivation();

  return (
    <div className={`${motivation.bgColor} border ${motivation.borderColor} rounded-2xl p-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl rounded-full" style={{ background: `linear-gradient(to bottom right, ${motivation.color})` }}></div>
      
      <div className="relative z-10 flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${motivation.color} text-white shadow-lg`}>
          {motivation.icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1 tracking-tight">
            {motivation.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {motivation.message}
          </p>
          {examType && (
            <p className="text-xs text-text-tertiary mt-2 opacity-60">
              Target: {examType}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotivationalBanner;
