import { Body, Container, Head, Html, Preview, Text, Button, Section, Hr } from "@react-email/components"
import Link from "next/link"

interface EmailTemplateProps {
    username: string
    url: string
}

export default function EmailTemplate({ username, url }: EmailTemplateProps) {
    return (
        <Html>
        <Head />
        <Preview>Verify your email address to get started with Bloggs</Preview>
        <Body
            style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: "#f8fafc",
            margin: 0,
            padding: 0,
            }}
        >
            <Container
            style={{
                maxWidth: "600px",
                margin: "0 auto",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            >
            {/* Header with Logo */}
            <Section
                style={{
                backgroundColor: "#1e40af",
                padding: "32px 24px",
                textAlign: "center",
                }}
            >
                <Text
                style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ffffff",
                    textAlign: "center",
                }}
                >
                Bloggs
                </Text>
            </Section>

            {/* Main Content */}
            <Section style={{ padding: "40px 24px" }}>
                <Text
                style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 16px 0",
                    textAlign: "center",
                }}
                >
                Verify Your Email Address
                </Text>

                <Text
                style={{
                    fontSize: "16px",
                    color: "#4b5563",
                    lineHeight: "24px",
                    margin: "0 0 24px 0",
                }}
                >
                Hello {username},
                </Text>

                <Text
                style={{
                    fontSize: "16px",
                    color: "#4b5563",
                    lineHeight: "24px",
                    margin: "0 0 32px 0",
                }}
                >
                Welcome to Bloggs! To get started and access all features, please verify your email address by clicking
                the button below.
                </Text>

                {/* Verification Button */}
                <div style={{ textAlign: "center", margin: "32px 0" }}>
                    <Link href={url}>
                        <Button
                            style={{
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                            padding: "14px 32px",
                            borderRadius: "6px",
                            fontSize: "16px",
                            fontWeight: "600",
                            textDecoration: "none",
                            display: "inline-block",
                            border: "none",
                            cursor: "pointer",
                            }}
                        >
                            Verify Email Address
                        </Button>
                    </Link>
                </div>
            </Section>

            <Hr
                style={{
                border: "none",
                borderTop: "1px solid #e5e7eb",
                margin: 0,
                }}
            />

            {/* Footer */}
            <Section
                style={{
                padding: "24px",
                backgroundColor: "#f9fafb",
                }}
            >
                <Text
                style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: "20px",
                    margin: "0 0 8px 0",
                    textAlign: "center",
                }}
                >
                This verification link will expire in 24 hours for security reasons.
                </Text>

                <Text
                style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: "20px",
                    margin: "0",
                    textAlign: "center",
                }}
                >
                If you didn't create an account with Bloggs, you can safely ignore this email.
                </Text>

                <Hr
                style={{
                    border: "none",
                    borderTop: "1px solid #e5e7eb",
                    margin: "16px 0",
                }}
                />

                <Text
                style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    lineHeight: "16px",
                    margin: "0",
                    textAlign: "center",
                }}
                >
                &copy; 2024 Bloggs. All rights reserved.
                </Text>
            </Section>
            </Container>

            {/* Outer spacing */}
            <div style={{ height: "40px" }}></div>
        </Body>
        </Html>
    )
}