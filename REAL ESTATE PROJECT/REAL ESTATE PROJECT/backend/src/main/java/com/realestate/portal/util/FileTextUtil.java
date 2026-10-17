package com.realestate.portal.util;

/**
 * Utility for safe serialization and deserialization of text lines.
 * Escapes pipe delimiters and newlines to prevent corrupting text file records.
 */
public final class FileTextUtil {

    private FileTextUtil() {
        // Prevent instantiation
    }

    public static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                    .replace("|", "\\p")
                    .replace("\r", "")
                    .replace("\n", "\\n");
    }

    public static String unescape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\n", "\n")
                    .replace("\\p", "|")
                    .replace("\\\\", "\\");
    }
}
