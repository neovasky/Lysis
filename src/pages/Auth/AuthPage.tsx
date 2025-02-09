/**
 * File: src/pages/Auth/AuthPage.tsx
 * Description: Authentication page component using Radix UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Text, Heading, Flex, Button } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
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
      await login("google@example.com", "google-auth");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--color-pageBackground)",
        paddingBottom: "25vh", // This will match your screenshot's vertical alignment
      }}
    >
      <Box
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          size="3"
          style={{
            width: "380px", // Increased width for better proportions
            padding: "24px",
            backgroundColor: "var(--gray-2)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box mb="2">
                <Heading size="6" weight="bold" mb="1">
                  Welcome Back
                </Heading>
                <Text color="gray" size="2">
                  Sign in to access your investment workspace
                </Text>
              </Box>

              <Button
                size="3"
                variant="surface"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{ width: "100%" }}
              >
                Continue with Google
              </Button>

              <Flex align="center" gap="3">
                <Box
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "var(--gray-5)",
                  }}
                />
                <Text size="2" color="gray">
                  or
                </Text>
                <Box
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "var(--gray-5)",
                  }}
                />
              </Flex>

              <Box>
                <Text size="2" mb="1" weight="medium">
                  Email
                </Text>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                  className="rt-TextFieldInput"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "6px",
                    backgroundColor: "var(--gray-3)",
                    color: "var(--gray-12)",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </Box>

              <Box>
                <Text size="2" mb="1" weight="medium">
                  Password
                </Text>
                <Box style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                    className="rt-TextFieldInput"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      paddingRight: "44px",
                      border: "1px solid var(--gray-5)",
                      borderRadius: "6px",
                      backgroundColor: "var(--gray-3)",
                      color: "var(--gray-12)",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "4px",
                      margin: 0,
                      height: "24px",
                      minWidth: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </Button>
                </Box>
              </Box>

              {error && (
                <Box
                  style={{
                    padding: "8px 12px",
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

              <Button
                type="submit"
                disabled={loading}
                size="2"
                style={{ width: "100%" }}
              >
                Sign In
              </Button>

              <Flex align="center" justify="center" gap="2">
                <Text size="2" color="gray">
                  Don't have an account?
                </Text>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth/signup")}
                  disabled={loading}
                >
                  Sign up
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Box>
    </div>
  );
};
