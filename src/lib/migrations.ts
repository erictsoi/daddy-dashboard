import { ChildProfile } from '../types';

/**
 * Migrates old lesson-direct-on-subject structure to the new topic-based structure.
 * This is a one-time migration for legacy data.
 */
export const migrateChildToTopicStructure = (child: ChildProfile): ChildProfile => {
    return {
        ...child,
        yearGroups: (child.yearGroups || []).map(yg => ({
            ...yg,
            subjects: (yg.subjects || []).map(sub => {
                // If it already has topics, it's migrated
                if (Array.isArray((sub as any).topics) && (sub as any).topics.length > 0) {
                    return sub;
                }

                const existingLessons = Array.isArray((sub as any).lessons) ? (sub as any).lessons : [];
                const topicName = sub.name && sub.name.includes(':')
                    ? sub.name.split(':')[1].trim()
                    : (sub.name || 'General');

                return {
                    ...sub,
                    topics: [{
                        id: `${sub.id}-topic-${Date.now()}`,
                        name: topicName,
                        lessons: existingLessons
                    }]
                };
            })
        }))
    };
};
