import Swal from 'sweetalert2';

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const Toast = (title, options = {}) => {
    const { icon = 'info', ...restOptions } = options;

    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        ...restOptions 
    });

    toast.fire({
        icon: icon,
        title: title
    });
}; 