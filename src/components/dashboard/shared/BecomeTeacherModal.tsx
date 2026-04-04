import { useState } from 'react';
import {
  X,
  Upload,
  Video,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useFileUploadHybrid } from '../../../hooks/useFileUploadHybrid';
import { submitTeacherApplication } from '../../../firebase/firebaseUserUtils';
import { auth } from '../../../firebase/firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';

type FormData = {
  education: string;
  yearsExperience: string;
  teachingCertificates: string;
  nativeLanguage: string;
  proficiencyLevel: string;
  bio: string;
  motivation: string;
  cvFile: File | null;
  pfpFile: File | null;
  videoFile: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const REQUIRED_FIELDS_BY_STEP: Record<number, (keyof FormData)[]> = {
  1: ['education', 'yearsExperience', 'nativeLanguage', 'proficiencyLevel'],
  2: ['bio', 'motivation', 'cvFile', 'pfpFile'],
};

interface BecomeTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: FormData = {
  education: '',
  yearsExperience: '',
  teachingCertificates: '',
  nativeLanguage: '',
  proficiencyLevel: '',
  bio: '',
  motivation: '',
  cvFile: null,
  pfpFile: null,
  videoFile: null,
};

export const BecomeTeacherModal = ({
  isOpen,
  onClose,
}: BecomeTeacherModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { addToast } = useToast();
  const { uploadFile } = useFileUploadHybrid();

  const totalSteps = 2;

  const resetState = () => {
    setCurrentStep(1);
    setErrors({});
    setFormData(initialFormData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'cvFile' | 'pfpFile' | 'videoFile',
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const cvTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (field === 'cvFile' && !cvTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cvFile: 'CV must be PDF, DOC, or DOCX',
      }));
      return;
    }

    if (field === 'pfpFile' && !file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        pfpFile: 'Profile picture must be an image file',
      }));
      return;
    }

    if (field === 'videoFile' && !file.type.startsWith('video/')) {
      setErrors((prev) => ({
        ...prev,
        videoFile: 'Intro file must be a video',
      }));
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field]: 'File size must be less than 50MB',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    const requiredFields = REQUIRED_FIELDS_BY_STEP[step];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] =
          `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    if (step === 2) {
      if (formData.bio.trim().length < 50) {
        newErrors.bio = 'Bio must be at least 50 characters';
      }
      if (formData.motivation.trim().length < 50) {
        newErrors.motivation = 'Motivation must be at least 50 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    setCurrentStep(Math.min(totalSteps, currentStep + 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setErrors({});
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      addToast({
        title: 'Error',
        message: 'You must be logged in to apply as a teacher.',
        type: 'warning',
      });
      return;
    }

    if (!formData.cvFile || !formData.pfpFile) {
      setErrors((prev) => ({
        ...prev,
        cvFile: formData.cvFile ? undefined : 'CV is required',
        pfpFile: formData.pfpFile ? undefined : 'Profile picture is required',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadFile(formData.cvFile, currentUser.uid, 'cv_file_path');
      await uploadFile(formData.pfpFile, currentUser.uid, 'pfp_file_path');

      if (formData.videoFile) {
        await uploadFile(
          formData.videoFile,
          currentUser.uid,
          'video_file_path',
        );
      }

      await submitTeacherApplication({
        teacher_bio: formData.bio,
        teacher_motivation: formData.motivation,
        teacher_education: formData.education,
        teacher_years_experience: formData.yearsExperience,
        teacher_certificates: formData.teachingCertificates,
        teacher_native_language: formData.nativeLanguage,
        teacher_proficiency_level: formData.proficiencyLevel,
        teacher_status: 'pending',
        last_applied_teacher: Math.floor(Date.now() / 1000),
      });

      // Send notification to student confirming application submission
      const functions = getFunctions();
      const notifyTeacherApplication = httpsCallable(
        functions,
        'notifyTeacherApplication',
      );
      await notifyTeacherApplication({
        studentName: `${currentUser.displayName || 'Student'}`,
        studentEmail: currentUser.email || undefined,
      });

      addToast({
        title: 'Application Submitted',
        message:
          'Your teacher application is now pending review. We will contact you soon.',
        type: 'success',
      });

      handleModalClose();
    } catch (error) {
      console.error('Error submitting teacher application:', error);
      addToast({
        title: 'Submission Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to submit application. Please try again.',
        type: 'warning',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className='space-y-6'>
          <div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              Professional Background
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Your account name and email are already on file. Add your teaching
              profile details here.
            </p>
          </div>

          <div className='space-y-4'>
            <FormSelect
              label='Highest Education Level *'
              name='education'
              value={formData.education}
              onChange={handleChange}
              error={errors.education}
              options={[
                { value: '', label: 'Select education level' },
                { value: 'bachelors', label: "Bachelor's Degree" },
                { value: 'masters', label: "Master's Degree" },
                { value: 'phd', label: 'PhD' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <FormSelect
              label='Years of Teaching Experience *'
              name='yearsExperience'
              value={formData.yearsExperience}
              onChange={handleChange}
              error={errors.yearsExperience}
              options={[
                { value: '', label: 'Select experience' },
                { value: '0-1', label: 'Less than 1 year' },
                { value: '1-3', label: '1-3 years' },
                { value: '3-5', label: '3-5 years' },
                { value: '5-10', label: '5-10 years' },
                { value: '10+', label: '10+ years' },
              ]}
            />

            <FormInput
              label='Teaching Certificates (e.g., TEFL, TESOL, CELTA)'
              name='teachingCertificates'
              type='text'
              placeholder='TEFL, TESOL, CELTA, etc.'
              value={formData.teachingCertificates}
              onChange={handleChange}
            />

            <FormInput
              label='Native Language *'
              name='nativeLanguage'
              type='text'
              placeholder='English'
              value={formData.nativeLanguage}
              onChange={handleChange}
              error={errors.nativeLanguage}
            />

            <FormSelect
              label='English Proficiency Level *'
              name='proficiencyLevel'
              value={formData.proficiencyLevel}
              onChange={handleChange}
              error={errors.proficiencyLevel}
              options={[
                { value: '', label: 'Select proficiency' },
                { value: 'native', label: 'Native Speaker' },
                { value: 'c2', label: 'C2 - Proficient' },
                { value: 'c1', label: 'C1 - Advanced' },
              ]}
            />
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div>
          <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
            Application & Files
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Upload one CV, one profile picture, and optionally one intro video.
          </p>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
              Short Bio *
            </label>
            <textarea
              name='bio'
              placeholder='Tell students about yourself and your teaching style...'
              value={formData.bio}
              onChange={handleChange}
              rows={2}
              className={`w-full px-4 py-2.5 border rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bio
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.bio && (
              <p className='mt-1 text-sm text-red-500'>{errors.bio}</p>
            )}
          </div>

          <div>
            <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
              Why do you want to teach here? *
            </label>
            <textarea
              name='motivation'
              placeholder='Share your motivation for joining our platform...'
              value={formData.motivation}
              onChange={handleChange}
              rows={2}
              className={`w-full px-4 py-2.5 border rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.motivation
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.motivation && (
              <p className='mt-1 text-sm text-red-500'>{errors.motivation}</p>
            )}
          </div>

          <FilePicker
            id='cv-upload'
            label='Upload CV *'
            accept='.pdf,.doc,.docx'
            icon={
              <Upload className='w-8 h-8 mb-2 text-gray-400 dark:text-gray-500' />
            }
            selectedName={formData.cvFile?.name}
            error={errors.cvFile}
            helper='PDF, DOC, DOCX (max 50MB)'
            onChange={(e) => handleFileChange(e, 'cvFile')}
          />

          <FilePicker
            id='pfp-upload'
            label='Upload Profile Picture *'
            accept='image/*'
            icon={
              <ImageIcon className='w-8 h-8 mb-2 text-gray-400 dark:text-gray-500' />
            }
            selectedName={formData.pfpFile?.name}
            error={errors.pfpFile}
            helper='Image files only (max 50MB)'
            onChange={(e) => handleFileChange(e, 'pfpFile')}
          />

          <FilePicker
            id='video-upload'
            label='Video Introduction (Optional)'
            accept='video/*'
            icon={
              <Video className='w-8 h-8 mb-2 text-gray-400 dark:text-gray-500' />
            }
            selectedName={formData.videoFile?.name}
            error={errors.videoFile}
            helper='Video file (max 50MB)'
            onChange={(e) => handleFileChange(e, 'videoFile')}
          />
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 dark:bg-black/70 backdrop-blur-sm'
      onClick={handleModalClose}
    >
      <div
        className='w-full max-w-2xl max-h-[min(calc(100dvh-2rem),920px)] my-auto flex flex-col overflow-hidden transition-all transform bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700 rounded-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative shrink-0 p-5 bg-linear-to-r from-blue-500 to-purple-600 rounded-t-xl sm:p-6'>
          <button
            onClick={handleModalClose}
            className='absolute p-2 transition-all rounded-lg top-3 right-3 sm:top-4 sm:right-4 hover:bg-white/10'
          >
            <X className='w-5 h-5 text-white' />
          </button>
          <h1 className='pr-10 text-xl font-bold text-white sm:text-2xl'>
            Become a Teacher
          </h1>
          <p className='mt-1 text-sm text-white/90 sm:text-base'>
            Complete your application using your existing account.
          </p>
        </div>

        <div className='flex flex-col flex-1 min-h-0'>
          <div className='flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6'>
            {renderStep()}
          </div>

          <div className='shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 pt-4'>
            <div className='flex items-center justify-between mb-3'>
              {[1, 2].map((step) => (
                <div key={step} className='flex items-center flex-1'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step === currentStep
                        ? 'bg-blue-500 text-white'
                        : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle className='w-5 h-5' />
                    ) : (
                      step
                    )}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className='flex gap-3 justify-between'>
              <button
                type='button'
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className='px-4 py-2.5 text-sm font-medium transition-all border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type='button'
                  onClick={handleNextStep}
                  className='px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                >
                  Next Step
                </button>
              ) : (
                <button
                  type='submit'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className='px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}: FormInputProps) {
  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
}

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  options: FormSelectOption[];
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  options,
}: FormSelectProps) {
  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
}

interface FilePickerProps {
  id: string;
  label: string;
  accept: string;
  icon: React.ReactNode;
  selectedName?: string;
  helper: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FilePicker({
  id,
  label,
  accept,
  icon,
  selectedName,
  helper,
  error,
  onChange,
}: FilePickerProps) {
  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
        {label}
      </label>
      <input
        type='file'
        accept={accept}
        onChange={onChange}
        className='hidden'
        id={id}
      />
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center px-4 py-4 sm:py-5 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          error
            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-blue-500'
        }`}
      >
        {icon}
        <span className='text-sm font-medium text-gray-900 dark:text-white'>
          {selectedName ? selectedName : `Click to upload (${helper})`}
        </span>
      </label>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
      {!error && (
        <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
          {helper}
        </p>
      )}
    </div>
  );
}
