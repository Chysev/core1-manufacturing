interface User {
  userName: string;
  fullName: string;
  email: string;
  role: string;
  image: UserImage;
}

interface UserImage {
  public_id: string;
  secure_url: string;
}

interface Register {
  email: string;
  name: string;
  password: string;
}

interface Login {
  email: string;
  password: string;
}
