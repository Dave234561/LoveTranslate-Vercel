import { Languages, MessageSquare, User, Heart } from "lucide-react";

export enum AppTab {
  TRANSLATION = "translation",
  MESSAGES = "messages",
  PROFILE = "profile"
}

interface BottomNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-primary/10 max-w-md mx-auto shadow-lg">
      <div className="flex justify-around p-1.5">
        {/* Translation Tab */}
        <button 
          className={`relative flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-all duration-200 ${
            activeTab === AppTab.TRANSLATION 
              ? 'bg-primary text-white shadow-md' 
              : 'text-gray-500 hover:bg-primary/5'
          }`}
          style={{
            background: activeTab === AppTab.TRANSLATION ? 'linear-gradient(135deg, hsl(338, 95%, 65%) 0%, hsl(330, 90%, 70%) 100%)' : ''
          }}
          onClick={() => onTabChange(AppTab.TRANSLATION)}
        >
          <Languages className="h-5 w-5" />
          <span className={`text-xs mt-1 font-medium`}>
            Translate
          </span>
          {activeTab === AppTab.TRANSLATION && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
          )}
        </button>
        
        {/* Messages Tab */}
        <button 
          className={`relative flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-all duration-200 ${
            activeTab === AppTab.MESSAGES 
              ? 'bg-primary text-white shadow-md' 
              : 'text-gray-500 hover:bg-primary/5'
          }`}
          style={{
            background: activeTab === AppTab.MESSAGES ? 'linear-gradient(135deg, hsl(338, 95%, 65%) 0%, hsl(330, 90%, 70%) 100%)' : ''
          }}
          onClick={() => onTabChange(AppTab.MESSAGES)}
        >
          <MessageSquare className="h-5 w-5" />
          <span className={`text-xs mt-1 font-medium`}>
            Messages
          </span>
          {activeTab === AppTab.MESSAGES && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
          )}
        </button>
        
        {/* Profile Tab */}
        <button 
          className={`relative flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-all duration-200 ${
            activeTab === AppTab.PROFILE 
              ? 'bg-primary text-white shadow-md' 
              : 'text-gray-500 hover:bg-primary/5'
          }`}
          style={{
            background: activeTab === AppTab.PROFILE ? 'linear-gradient(135deg, hsl(338, 95%, 65%) 0%, hsl(330, 90%, 70%) 100%)' : ''
          }}
          onClick={() => onTabChange(AppTab.PROFILE)}
        >
          <User className="h-5 w-5" />
          <span className={`text-xs mt-1 font-medium`}>
            Profile
          </span>
          {activeTab === AppTab.PROFILE && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
          )}
        </button>
      </div>
    </nav>
  );
}
