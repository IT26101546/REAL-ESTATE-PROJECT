package com.realestate.portal.util;

import java.util.UUID;

/**
 * Utility for creating recognizable unique identifiers for entities.
 */
public final class IdGenerator {

    private IdGenerator() {
    }

    public static String nextId(String prefix) {
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + randomPart;
    }
}
