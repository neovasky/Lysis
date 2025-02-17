import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, FileText, Pencil, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  bio: string;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: "Investment Corp",
    bio: "Passionate about market analysis and investment research.",
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleChange =
    (field: keyof ProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setError(null);
      setSuccess(null);
    };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      setError("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Profile</h2>
        <p className="text-gray-600 text-sm">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Content */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold mb-4 sm:mb-0">
            {profileData.firstName[0]}
            {profileData.lastName[0]}
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    placeholder="First Name"
                    value={profileData.firstName}
                    onChange={handleChange("firstName")}
                    className="flex-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                  />
                  <input
                    placeholder="Last Name"
                    value={profileData.lastName}
                    onChange={handleChange("lastName")}
                    className="flex-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded bg-red-200 border border-red-400">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded bg-green-200 border border-green-400">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <hr className="my-6 border-gray-300" />

        {/* Profile Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm text-gray-600">Email</span>
            </div>
            {isEditing ? (
              <input
                value={profileData.email}
                onChange={handleChange("email")}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 text-sm"
              />
            ) : (
              <p>{profileData.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm text-gray-600">Company</span>
            </div>
            {isEditing ? (
              <input
                value={profileData.company}
                onChange={handleChange("company")}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 text-sm"
              />
            ) : (
              <p>{profileData.company}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm text-gray-600">Bio</span>
            </div>
            {isEditing ? (
              <input
                value={profileData.bio}
                onChange={handleChange("bio")}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 text-sm"
              />
            ) : (
              <p>{profileData.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white shadow rounded p-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-medium">Account</h4>
          <p className="text-sm text-gray-600">Sign out of your account</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-fit"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
