import { z } from 'zod';

// Schema for ESNers (more strict)
const esnerProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  photoURL: z.string().optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio too long').optional(),
  nationality: z.string().max(50, 'Nationality too long').optional(),
  starters: z.array(z.string().min(1).max(100)).min(1, 'At least one starter is required').max(3, 'Maximum 3 starters'),
  interests: z.array(z.string().min(1).max(30)).min(1, 'At least one interest is required'),
  instagram: z.string().max(50, 'Instagram handle too long').optional(),
  linkedin: z.string().max(100, 'LinkedIn URL too long').optional(),
  visible: z.boolean()
});

// Schema for participants (more flexible)
const participantProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  photoURL: z.string().optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio too long').optional(),
  nationality: z.string().max(50, 'Nationality too long').optional(),
  starters: z.array(z.string().min(1).max(100)).optional(),
  interests: z.array(z.string().min(1).max(30)).optional(),
  instagram: z.string().max(50, 'Instagram handle too long').optional(),
  linkedin: z.string().max(100, 'LinkedIn URL too long').optional(),
  visible: z.boolean().optional()
});

type ProfileForm = z.infer<typeof esnerProfileSchema>;
