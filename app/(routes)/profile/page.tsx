"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Camera,
    User,
    Mail,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";


export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for editing
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // Sync user data to local state when loaded
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? "");
            setLastName(user.lastName ?? "");
        }
    }, [user]);

    // Clear save status after 3 seconds
    useEffect(() => {
        if (saveStatus !== "idle") {
            const timer = setTimeout(() => setSaveStatus("idle"), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSaveStatus("idle");

        try {
            // Update profile image if changed
            if (imageFile) {
                await user.setProfileImage({ file: imageFile });
            }

            // Update name fields
            await user.update({
                firstName,
                lastName,
            });

            setSaveStatus("success");
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Failed to update profile:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges =
        firstName !== (user?.firstName ?? "") ||
        lastName !== (user?.lastName ?? "") ||
        imageFile !== null;

    // Loading state
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Not signed in</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Please sign in to view your profile.
                    </p>
                </div>
            </div>
        );
    }

    const userInitials =
        (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") ||
        user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
        "U";

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Edit Profile"
                subtitle="Manage your personal information and profile picture."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Picture Section */}
                <div className="lg:col-span-1">
                    <div className="rounded-3xl glass-card p-6">
                        <h2 className="text-sm font-semibold mb-4">Profile Picture</h2>

                        <div className="flex flex-col items-center">
                            {/* Avatar with upload overlay */}
                            <div className="relative group">
                                <Avatar className="h-32 w-32 rounded-3xl ring-4 ring-background ios-shadow">
                                    <AvatarImage
                                        src={imagePreview ?? user.imageUrl}
                                        alt={user.fullName ?? "Profile"}
                                        className="rounded-3xl object-cover"
                                    />
                                    <AvatarFallback
                                        className={cn(
                                            "rounded-3xl text-2xl font-bold text-white",
                                            "bg-gradient-to-br from-violet-500 to-purple-600"
                                        )}
                                    >
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Upload overlay */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "absolute inset-0 flex items-center justify-center",
                                        "rounded-3xl bg-black/50",
                                        "opacity-0 group-hover:opacity-100",
                                        "ios-transition cursor-pointer"
                                    )}
                                >
                                    <Camera className="h-8 w-8 text-white" />
                                </button>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Upload button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "mt-4 rounded-xl text-xs",
                                    "border border-transparent",
                                    "hover-glass-light"
                                )}
                            >
                                <Camera className="h-4 w-4 mr-2" />
                                {imagePreview ? "Change Image" : "Upload New Image"}
                            </Button>

                            {/* Preview indicator */}
                            {imagePreview && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    New image selected. Click Save to apply.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details Section */}
                <div className="lg:col-span-2">
                    <div className="rounded-3xl glass-card p-6">
                        <h2 className="text-sm font-semibold mb-6">Personal Information</h2>

                        <div className="space-y-5">
                            {/* First Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="firstName"
                                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                >
                                    First Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter your first name"
                                        className={cn(
                                            "pl-10 h-12 rounded-xl",
                                            "border-border/50 bg-background/50",
                                            "focus:bg-background focus:border-primary/50",
                                            "ios-transition"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="lastName"
                                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                >
                                    Last Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter your last name"
                                        className={cn(
                                            "pl-10 h-12 rounded-xl",
                                            "border-border/50 bg-background/50",
                                            "focus:bg-background focus:border-primary/50",
                                            "ios-transition"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                >
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user.primaryEmailAddress?.emailAddress ?? ""}
                                        readOnly
                                        disabled
                                        className={cn(
                                            "pl-10 h-12 rounded-xl",
                                            "border-border/50 bg-muted/30",
                                            "text-muted-foreground cursor-not-allowed"
                                        )}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Email cannot be changed here. Contact support if needed.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/50 my-6" />

                            {/* Save Button */}
                            <div className="flex items-center justify-between">
                                <div>
                                    {saveStatus === "success" && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-sm animate-in fade-in-0 slide-in-from-left-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Profile updated successfully!</span>
                                        </div>
                                    )}
                                    {saveStatus === "error" && (
                                        <div className="flex items-center gap-2 text-rose-500 text-sm animate-in fade-in-0 slide-in-from-left-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Failed to update profile. Please try again.</span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                    className={cn(
                                        "h-12 px-6 rounded-xl",
                                        "bg-gradient-to-r from-blue-500 to-indigo-600",
                                        "hover:from-blue-600 hover:to-indigo-700",
                                        "text-white font-medium",
                                        "ios-shadow",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        "ios-transition active:scale-95"
                                    )}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="rounded-3xl glass-card p-6 mt-6">
                        <h2 className="text-sm font-semibold mb-4">Account Information</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl glass-subtle p-4">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Account Created
                                </p>
                                <p className="text-sm font-medium">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                            <div className="rounded-2xl glass-subtle p-4">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Last Sign In
                                </p>
                                <p className="text-sm font-medium">
                                    {user.lastSignInAt
                                        ? new Date(user.lastSignInAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
