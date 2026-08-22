/**
 * Validation for student create/update requests. Kept deliberately simple
 * and framework-free — the chapters don't specify a rigid matric-number
 * format, so this checks presence and shape rather than a strict pattern
 * that might reject real KASU matric numbers.
 */
export function validateStudentInput(data, { isUpdate = false } = {}) {
  const errors = {};

  if (!isUpdate || data.matricNumber !== undefined) {
    if (!data.matricNumber || !data.matricNumber.trim()) {
      errors.matricNumber = "Matric number is required.";
    }
  }

  if (!isUpdate || data.fullName !== undefined) {
    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
  }

  if (!isUpdate || data.department !== undefined) {
    if (!data.department || !data.department.trim()) {
      errors.department = "Department is required.";
    }
  }

  if (!isUpdate || data.level !== undefined) {
    if (!data.level || !data.level.trim()) {
      errors.level = "Level is required.";
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
