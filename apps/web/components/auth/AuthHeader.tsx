interface AuthHeaderProps {
  title: string;
  description: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-2 ">
      <div className="my-3 text-2xl font-extrabold">Cdraw</div>
      <div className="text-2xl font-medium">{title}</div>
      <div className="text-gray-500 text-sm font-normal">{description}</div>
    </div>
  );
}
