import { getRooms } from "@/actions/roomAction";
import { Rooms } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const MeetDrawView = () => {
  const [rooms, setRooms] = useState<Rooms[]>([]);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await getRooms({ search });
      setRooms(data?.rooms);
    };
    fetchRooms();
  }, [search]);

  if (!rooms) {
    return null;
  }

  return (
    <>
      <div className="flex w-full items-center">
        <SearchBar />
      </div>
    </>
  );
};

export default MeetDrawView;
