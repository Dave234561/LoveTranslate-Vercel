import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import TranslationTab from "@/components/translation/translation-tab";
import MessagesTab from "@/components/messages/messages-tab";
import ProfileTab from "@/components/profile/profile-tab";
import BottomNavigation, { AppTab } from "@/components/layout/bottom-navigation";
import NotificationDropdown, { Notification } from "@/components/layout/notification-dropdown";
import { MessageSquare, Bell } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRANSLATION);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useAuth();
  
  // Mock notifications - in a real app, these would come from the server
  const notifications: Notification[] = [
    {
      id: 1,
      title: "New message",
      message: "You received a new message from Marie Dupont",
      time: "2 minutes ago",
      type: "message" as const
    },
    {
      id: 2,
      title: "Translation saved",
      message: "Your translation was successfully saved to favorites",
      time: "1 hour ago",
      type: "translation" as const
    }
  ];

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const userInitials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() 
    : user?.username?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="w-full mx-auto min-h-screen max-w-md shadow-xl relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 to-white -z-10"></div>
      
      {/* Header with app name and notifications */}
      <header 
        className="text-white p-4 flex justify-between items-center"
        style={{
          background: "linear-gradient(135deg, hsl(338, 95%, 65%) 0%, hsl(330, 90%, 70%) 100%)"
        }}
      >
        <div className="flex items-center">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mr-3 backdrop-blur-sm shadow-sm border border-white/30">
            <span className="font-bold text-xl font-heading">L</span>
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold tracking-tight">LoveTranslate</h1>
            <p className="text-xs text-white/90 font-medium">Connect through language</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/30 shadow-sm backdrop-blur-sm">
            <span className="font-medium text-sm">{userInitials}</span>
          </div>
          <div className="relative">
            <button 
              className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors" 
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center shadow-sm border border-white/30">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <NotificationDropdown 
                notifications={notifications} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            )}
          </div>
        </div>
      </header>
      
      {/* Top Navigation Tabs - Only for wider screens */}
      <nav className="hidden md:flex px-4 py-2 bg-white/70 backdrop-blur-sm border-b border-primary/10 justify-center space-x-2">
        <button 
          className={`love-nav-tab ${activeTab === AppTab.TRANSLATION ? 'active' : ''}`} 
          onClick={() => setActiveTab(AppTab.TRANSLATION)}
        >
          Translation
        </button>
        <button 
          className={`love-nav-tab ${activeTab === AppTab.MESSAGES ? 'active' : ''}`} 
          onClick={() => setActiveTab(AppTab.MESSAGES)}
        >
          Messages
        </button>
        <button 
          className={`love-nav-tab ${activeTab === AppTab.PROFILE ? 'active' : ''}`} 
          onClick={() => setActiveTab(AppTab.PROFILE)}
        >
          Profile
        </button>
      </nav>
      
      {/* Main Content Area */}
      <main className="pb-16">
        {activeTab === AppTab.TRANSLATION && <TranslationTab />}
        {activeTab === AppTab.MESSAGES && <MessagesTab />}
        {activeTab === AppTab.PROFILE && <ProfileTab />}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
