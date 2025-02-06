/**
 * File: src/pages/Auth/AuthPage.tsx
 * Description: Authentication page component
 */

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleChange =
    (field: keyof AuthFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
    };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        setError("Please provide your full name");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || loading) return;

    try {
      setLoading(true);
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
        });
      }
      navigate("/");
    } catch (err) {
      setError(
        isLogin
          ? "Login failed. Please try again."
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: "google" | "github") => {
    // Implement social auth logic here
    console.log(`Authenticating with ${provider}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: "400px",
          p: 4,
          mx: 2,
        }}
        elevation={4}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Typography>
            <Typography color="text.secondary">
              {isLogin
                ? "Sign in to access your investment workspace"
                : "Start your investment journey with Lysis"}
            </Typography>
          </Box>

          {/* Social Auth */}
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialAuth("google")}
              sx={{
                height: 44,
                borderColor: "rgba(144, 202, 249, 0.12)",
                "&:hover": {
                  borderColor: "rgba(144, 202, 249, 0.24)",
                },
              }}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHubIcon />}
              onClick={() => handleSocialAuth("github")}
              sx={{
                height: 44,
                borderColor: "rgba(144, 202, 249, 0.12)",
                "&:hover": {
                  borderColor: "rgba(144, 202, 249, 0.24)",
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Stack>

          <Divider>
            <Typography color="text.secondary">or</Typography>
          </Divider>

          {/* Auth Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {!isLogin && (
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    disabled={loading}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    disabled={loading}
                  />
                </Stack>
              )}

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange("email")}
                disabled={loading}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={formData.password}
                onChange={handleChange("password")}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isLogin && (
                <TextField
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  disabled={loading}
                />
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </Stack>
          </form>

          {/* Toggle Auth Mode */}
          <Box sx={{ textAlign: "center" }}>
            <Typography color="text.secondary">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                color="primary"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    firstName: "",
                    lastName: "",
                  });
                }}
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Button>
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
