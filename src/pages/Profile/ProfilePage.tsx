/**
 * File: src/pages/Profile/ProfilePage.tsx
 * Description: User profile page component using Radix UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Flex,
  Text,
  Heading,
  Avatar,
  Button,
} from "@radix-ui/themes";
import {
  EnvelopeClosedIcon,
  PersonIcon,
  FileTextIcon,
  Pencil1Icon,
  ExitIcon,
} from "@radix-ui/react-icons";
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
    <Box style={{ padding: "24px" }}>
      {/* Header */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="6" weight="bold" mb="2">
          Profile
        </Heading>
        <Text color="gray" size="2">
          Manage your personal information and preferences
        </Text>
      </Card>

      {/* Profile Content */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Flex direction="column" gap="6">
          {/* Profile Header */}
          <Flex
            direction={{ initial: "column", sm: "row" }}
            gap="4"
            align={{ initial: "center", sm: "start" }}
          >
            <Avatar
              size="7"
              fallback={`${profileData.firstName[0]}${profileData.lastName[0]}`}
              radius="full"
            />

            <Box style={{ flex: 1 }}>
              {isEditing ? (
                <Flex direction="column" gap="3">
                  <Flex gap="3">
                    <input
                      placeholder="First Name"
                      value={profileData.firstName}
                      onChange={handleChange("firstName")}
                      className="rt-TextFieldInput"
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid var(--gray-5)",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-panel)",
                        color: "var(--gray-12)",
                      }}
                    />
                    <input
                      placeholder="Last Name"
                      value={profileData.lastName}
                      onChange={handleChange("lastName")}
                      className="rt-TextFieldInput"
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid var(--gray-5)",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-panel)",
                        color: "var(--gray-12)",
                      }}
                    />
                  </Flex>
                  <Button onClick={handleSave}>Save Changes</Button>
                </Flex>
              ) : (
                <>
                  <Heading size="5" mb="2">
                    {`${profileData.firstName} ${profileData.lastName}`}
                  </Heading>
                  <Button variant="soft" onClick={handleEdit}>
                    <Pencil1Icon width="16" height="16" />
                    Edit Profile
                  </Button>
                </>
              )}
            </Box>
          </Flex>

          {error && (
            <Box
              style={{
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "var(--red-3)",
                border: "1px solid var(--red-6)",
              }}
            >
              <Text color="red" size="2">
                {error}
              </Text>
            </Box>
          )}

          {success && (
            <Box
              style={{
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "var(--green-3)",
                border: "1px solid var(--green-6)",
              }}
            >
              <Text color="green" size="2">
                {success}
              </Text>
            </Box>
          )}

          <Box style={{ height: "1px", background: "var(--gray-5)" }} />

          {/* Profile Details */}
          <Flex direction="column" gap="4">
            <Box>
              <Flex align="center" gap="2" mb="2">
                <EnvelopeClosedIcon width="16" height="16" />
                <Text size="2" color="gray">
                  Email
                </Text>
              </Flex>
              {isEditing ? (
                <input
                  value={profileData.email}
                  onChange={handleChange("email")}
                  className="rt-TextFieldInput"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-panel)",
                    color: "var(--gray-12)",
                  }}
                />
              ) : (
                <Text>{profileData.email}</Text>
              )}
            </Box>

            <Box>
              <Flex align="center" gap="2" mb="2">
                <PersonIcon width="16" height="16" />
                <Text size="2" color="gray">
                  Company
                </Text>
              </Flex>
              {isEditing ? (
                <input
                  value={profileData.company}
                  onChange={handleChange("company")}
                  className="rt-TextFieldInput"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-panel)",
                    color: "var(--gray-12)",
                  }}
                />
              ) : (
                <Text>{profileData.company}</Text>
              )}
            </Box>

            <Box>
              <Flex align="center" gap="2" mb="2">
                <FileTextIcon width="16" height="16" />
                <Text size="2" color="gray">
                  Bio
                </Text>
              </Flex>
              {isEditing ? (
                <input
                  value={profileData.bio}
                  onChange={handleChange("bio")}
                  className="rt-TextFieldInput"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-panel)",
                    color: "var(--gray-12)",
                  }}
                />
              ) : (
                <Text>{profileData.bio}</Text>
              )}
            </Box>
          </Flex>
        </Flex>
      </Card>

      {/* Logout Section */}
      <Card size="3">
        <Flex direction="column" gap="2">
          <Heading size="3" weight="medium">
            Account
          </Heading>
          <Text size="2" color="gray">
            Sign out of your account
          </Text>
          <Button
            variant="soft"
            color="red"
            onClick={handleLogout}
            style={{ width: "fit-content" }}
          >
            <ExitIcon />
            Logout
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};
