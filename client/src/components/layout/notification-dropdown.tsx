import { useEffect, useRef } from "react";
import { MessageSquare, Heart, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "message" | "translation" | "system";
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
}

export default function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const getIconForType = (type: "message" | "translation" | "system") => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-white" />;
      case "translation":
        return <Heart className="h-4 w-4 text-white" />;
      default:
        return <Bell className="h-4 w-4 text-white" />;
    }
  };

  const getBackgroundForType = (type: "message" | "translation" | "system") => {
    switch (type) {
      case "message":
        return "bg-primary";
      case "translation":
        return "bg-pink-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleMarkAllAsRead = () => {
    // In a real app, we would update the notifications' read status
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-100"
    >
      <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 flex justify-between items-center border-b border-primary/10">
        <h3 className="text-sm font-medium text-primary/90 flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-gray-500 hover:text-primary"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className="p-3 border-b border-gray-100 hover:bg-gray-50/70 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full ${getBackgroundForType(notification.type as "message" | "translation" | "system")} flex items-center justify-center shadow-sm`}>
                    {getIconForType(notification.type as "message" | "translation" | "system")}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-primary/70 mt-1.5">{notification.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 text-center bg-gray-50">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary/80 hover:bg-primary/5 text-xs"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      )}
    </div>
  );
}
