/**
 * File: src/pages/Profile/ProfilePage.tsx
 * Description: User profile page component
 */

import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useState } from "react";

interface ProfileData {
  name: string;
  email: string;
  company: string;
  bio: string;
}

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Investment Corp",
    bio: "Passionate about market analysis and investment research.",
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the data to your backend
    console.log("Saving profile data:", profileData);
  };

  const handleChange =
    (field: keyof ProfileData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
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
              {profileData.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {isEditing ? (
                <Stack spacing={2}>
                  <TextField
                    label="Name"
                    value={profileData.name}
                    onChange={handleChange("name")}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
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
                    {profileData.name}
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
