import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Camera, 
  User, 
  Bell, 
  Moon, 
  Mail, 
  Globe, 
  Languages, 
  LogOut, 
  Clock, 
  Lock, 
  Save,
  CheckSquare,
  Pencil,
  Trash2,
  Star
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  langPreference: z.enum(["en", "fr"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock translation history data
const favoriteTranslations = [
  {
    id: 1,
    text: "Hello, how are you?",
    translation: "Bonjour, comment allez-vous?",
    fromLang: "en",
    toLang: "fr",
    date: "2 days ago"
  },
  {
    id: 2,
    text: "I'm learning French",
    translation: "J'apprends le français",
    fromLang: "en",
    toLang: "fr",
    date: "1 week ago"
  },
  {
    id: 3,
    text: "Je suis très heureux de vous rencontrer",
    translation: "I am very happy to meet you",
    fromLang: "fr",
    toLang: "en",
    date: "2 weeks ago"
  }
];

// Mock achievement data
const achievements = [
  { id: 1, name: "First Translation", description: "Complete your first translation", completed: true },
  { id: 2, name: "Conversation Starter", description: "Start your first conversation", completed: true },
  { id: 3, name: "Language Expert", description: "Translate 50 phrases", completed: false, progress: 35 },
  { id: 4, name: "Multilingual", description: "Use the app in both languages", completed: false, progress: 50 },
  { id: 5, name: "Social Butterfly", description: "Message 5 different people", completed: false, progress: 40 },
];

export default function ProfileTab() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");
  
  // App settings
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    autoTranslate: true,
    sendReadReceipts: true,
  });

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
    toast({
      title: `${setting} ${!settings[setting] ? 'enabled' : 'disabled'}`,
      description: `You have ${!settings[setting] ? 'enabled' : 'disabled'} ${setting} for your account.`,
    });
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      langPreference: user?.langPreference as "en" | "fr" || "en",
      username: user?.username || "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    // In a real app, we would update the user profile here
    console.log("Save profile changes:", values);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const userInitials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() 
    : user?.username?.substring(0, 2).toUpperCase() || "U";

  const handleRemoveFavorite = (id: number) => {
    toast({
      title: "Translation removed",
      description: "The translation has been removed from your favorites",
    });
  };

  return (
    <section className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold font-heading flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" />
          Profile
        </h2>
      </div>
      
      <Tabs 
        defaultValue="profile" 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="overflow-hidden border-primary/10">
            <CardContent className="p-0">
              <div className="bg-primary/5 p-6 flex flex-col items-center justify-center relative">
                <div className="absolute top-2 right-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full h-8 w-8 text-gray-600 hover:text-primary hover:bg-white/80"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-md">
                  <AvatarFallback className="bg-primary text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{user?.name || user?.username}</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mr-2">
                    <Languages className="h-3 w-3 mr-1" />
                    {user?.langPreference === "fr" ? "French" : "English"}
                  </Badge>
                  <Badge variant="outline" className="border-secondary/30 text-secondary">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                    Beginner
                  </Badge>
                </div>
              </div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-gray-100">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="langPreference"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  This will be your default app interface language
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              type="submit" 
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-medium flex items-center">
                <Bell className="h-4 w-4 mr-2 text-primary" />
                App Settings
              </CardTitle>
              <CardDescription>
                Configure your app preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Push Notifications</label>
                  <p className="text-xs text-gray-500">Receive push alerts for new messages</p>
                </div>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={() => toggleSetting('pushNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs text-gray-500">Receive email updates about activity</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={() => toggleSetting('emailNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-Translate Messages</label>
                  <p className="text-xs text-gray-500">Automatically translate incoming messages</p>
                </div>
                <Switch 
                  checked={settings.autoTranslate}
                  onCheckedChange={() => toggleSetting('autoTranslate')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Read Receipts</label>
                  <p className="text-xs text-gray-500">Let others know when you've read messages</p>
                </div>
                <Switch 
                  checked={settings.sendReadReceipts}
                  onCheckedChange={() => toggleSetting('sendReadReceipts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-xs text-gray-500">Switch to dark theme</p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={() => toggleSetting('darkMode')}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100"
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </>
              )}
            </Button>
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 text-gray-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-medium flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" fill="currentColor" />
                Saved Translations
              </CardTitle>
              <CardDescription>
                Translations you've saved for quick reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteTranslations.length > 0 ? (
                <div className="space-y-3">
                  {favoriteTranslations.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="p-3 relative">
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={() => handleRemoveFavorite(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="mb-2 flex items-center">
                          <Badge className="mr-2 bg-primary/10 text-primary border-none hover:bg-primary/20">
                            {item.fromLang === "en" ? "EN → FR" : "FR → EN"}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.text}</p>
                        <p className="text-sm text-gray-600">{item.translation}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-md font-medium mb-1">No saved translations yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Star translations you want to remember for later
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-medium flex items-center">
                <CheckSquare className="h-4 w-4 mr-2 text-primary" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Track your progress in learning languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      achievement.completed 
                        ? "bg-green-100 text-green-600" 
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {achievement.completed ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium">{achievement.name}</h4>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                        </div>
                        {achievement.completed && (
                          <Badge className="bg-green-100 text-green-600 hover:bg-green-200 border-none">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      {!achievement.completed && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
