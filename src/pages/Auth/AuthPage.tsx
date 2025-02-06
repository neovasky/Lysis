/**
 * File: src/pages/Auth/AuthPage.tsx
 * Description: Authentication page component
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  InputBase,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { handleGoogleSignIn } from "../../utils/googleAuth";

interface AuthFormData {
  email: string;
  password: string;
}

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await handleGoogleSignIn();

      // For now, let's mock a successful login since we don't have a backend
      await login("google@example.com", "google-auth");

      // After successful login, redirect to home
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#1e1e1e",
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: "100%",
          maxWidth: "320px",
          p: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary">
            Sign in to access your investment workspace
          </Typography>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{
            color: "white",
            textTransform: "uppercase",
            borderColor: "rgba(255, 255, 255, 0.12)",
            py: 1,
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          Continue with Google
        </Button>

        <Box sx={{ position: "relative" }}>
          <Divider
            sx={{
              "&::before, &::after": {
                borderColor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <Typography color="text.secondary" sx={{ px: 1 }}>
              or
            </Typography>
          </Divider>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <InputBase
                fullWidth
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
                sx={{
                  py: 1,
                  color: "white",
                  "&::placeholder": {
                    color: "text.secondary",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <InputBase
                fullWidth
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  py: 1,
                  color: "white",
                  "&::placeholder": {
                    color: "text.secondary",
                  },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: "#90caf9",
                color: "black",
                py: 1,
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "#82b7e3",
                },
              }}
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <Box sx={{ textAlign: "center" }}>
          <Typography color="text.secondary">
            Don't have an account?{" "}
            <Button
              color="primary"
              onClick={() => navigate("/auth/signup")}
              disabled={loading}
              sx={{
                textTransform: "uppercase",
                color: "#90caf9",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
