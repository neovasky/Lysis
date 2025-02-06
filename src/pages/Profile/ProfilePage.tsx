/**
 * File: src/pages/Profile/ProfilePage.tsx
 * Description: User profile page component using auth context
 */

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  Button,
  TextField,
  Divider,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  bio: string;
}

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: "Investment Corp", // You might want to add this to your user type
    bio: "Passionate about market analysis and investment research.", // You might want to add this to your user type
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
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
      setSuccess(null);
    };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Profile
        </Typography>
        <Typography color="text.secondary">
          Manage your personal information and preferences
        </Typography>
      </Paper>

      {/* Profile Content */}
      <Paper sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* Profile Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "center", sm: "flex-start" }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "2rem",
              }}
            >
              {`${profileData.firstName.charAt(0)}${profileData.lastName.charAt(
                0
              )}`}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              {isEditing ? (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="First Name"
                      value={profileData.firstName}
                      onChange={handleChange("firstName")}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={handleChange("lastName")}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    {`${profileData.firstName} ${profileData.lastName}`}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      borderColor: "rgba(144, 202, 249, 0.12)",
                      "&:hover": {
                        borderColor: "rgba(144, 202, 249, 0.24)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Divider />

          {/* Profile Details */}
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <EmailIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
              </Stack>
              {isEditing ? (
                <TextField
                  value={profileData.email}
                  onChange={handleChange("email")}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography>{profileData.email}</Typography>
              )}
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <WorkIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Company
                </Typography>
              </Stack>
              {isEditing ? (
                <TextField
                  value={profileData.company}
                  onChange={handleChange("company")}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography>{profileData.company}</Typography>
              )}
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <DescriptionIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Bio
                </Typography>
              </Stack>
              {isEditing ? (
                <TextField
                  value={profileData.bio}
                  onChange={handleChange("bio")}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography>{profileData.bio}</Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
