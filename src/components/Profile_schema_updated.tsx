// Schema for ESNers (more strict)
const esnerProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  photoURL: z.string().optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio muito longa').optional(),
  nationality: z.string().max(50, 'Nacionalidade muito longa').optional(),
  starters: z.array(z.string().min(1).max(100)).min(1, 'Pelo menos um starter é obrigatório').max(3, 'Máximo 3 starters'),
  interests: z.array(z.string().min(1).max(30)).min(1, 'Pelo menos um interesse é obrigatório'),
  instagram: z.string().max(50, 'Instagram muito longo').optional(),
  linkedin: z.string().max(100, 'LinkedIn muito longo').optional(),
  visible: z.boolean()
});

// Schema for participants (more flexible)
const participantProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  photoURL: z.string().optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio muito longa').optional(),
  nationality: z.string().max(50, 'Nacionalidade muito longa').optional(),
  starters: z.array(z.string().min(1).max(100)).optional(),
  interests: z.array(z.string().min(1).max(30)).optional(),
  instagram: z.string().max(50, 'Instagram muito longo').optional(),
  linkedin: z.string().max(100, 'LinkedIn muito longo').optional(),
  visible: z.boolean().optional()
});

type ProfileForm = z.infer<typeof esnerProfileSchema>;
