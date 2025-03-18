import imaps from "imap-simple";

export const getProviderFromEmail = (email: string): string | null => {
    if (!email.includes("@")) return null; // Validate email format
    return email.split("@")[1].split(".")[0]; // Extract the provider (before the first dot)
};


export const emailLogin = async (
  email: string,
  password: string,
  host: string,
  tls: boolean
): Promise<boolean> => {
  try {
    const config = {
      imap: {
        user: email,
        password: password,
        host: `mail.${host}.com`, // e.g., "imap.gmail.com"
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }, // Ignore certificate validation
        authTimeout: 10000, // 10 seconds timeout
      },
    };


    // Attempt to connect
    const connection = await imaps.connect(config);

    if (connection) {
     
      await connection.end(); // Ensure proper logout
      return true;
    }

    return false;
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("IMAP login failed:", error.message);
    } else {
        console.error("IMAP login failed:", error); // Handle non-Error cases
    }
    return false;
  }
};
