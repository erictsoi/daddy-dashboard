export const toKidDash = (childId: string) => `/kiddash?child=${encodeURIComponent(childId)}`;

export const toLessonView = (params: {
  childId: string;
  lessonId: string;
  subjectId?: string;
  topic?: string;
  url?: string;
}) => {
  const searchParams = new URLSearchParams();
  searchParams.set('child', params.childId);
  searchParams.set('lesson', params.lessonId);
  if (params.subjectId) searchParams.set('subject', params.subjectId);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.url) searchParams.set('url', params.url);
  return `/lessonview?${searchParams.toString()}`;
};

export const toAdminDash = () => '/admindash';
export const toLanding = () => '/';
export const toMarketplace = () => '/marketplace';
export const toCurriculumBuilder = () => '/curriculumbuilder';
export const toCurriculumLibrary = () => '/curriculumlibrary';
export const toCurriculumValidator = () => '/curriculumvalidator';
export const toCurriculumSearch = () => '/curriculumsearch';
export const toProfiles = () => '/returningview';

