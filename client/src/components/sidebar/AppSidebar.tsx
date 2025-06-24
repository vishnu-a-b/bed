import { ChevronUp, ChevronsUpDown, Building2, Check } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { logout } from "@/utils/api/apiAuth";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { Button } from "../ui/button";

import { clearStaffId } from "@/lib/slice/staffSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectUserDetails } from "@/lib/slice/userSlice";
import { RootState } from "@/lib/store";
import { changeLink } from "@/lib/slice/LinkSlice";
import { clearUpdate } from "@/lib/slice/updateSlice";

// Menu items.

export function AppSidebar(props: any) {
  const { data, rol, items } = props;
  const [selectedVersion, setSelectedVersion] = useState({
    id: data?.items[0]?._id,
    label: data?.items[0]?.name,
  });
  const [isClick, setIsClick] = useState(false);
  const [click, setClick] = useState("");
  const userDetails = useSelector(selectUserDetails);
  const staffId: string | null = useSelector(
    (state: RootState) => state.staff.id
  );
  const link: string = useSelector((state: RootState) => state.link.link);
  const dispatch = useDispatch();

  useEffect(() => {
    // Update the `link` state with the last segment of the current path
    const links = window.location.pathname.split("/");
    console.log(links[links.length - 1]);

    if (click) {
      dispatch(changeLink(click));
      dispatch(clearUpdate());
    } else {
      dispatch(changeLink(links[links.length - 1]));
    }

    // Optional: set up a listener to update `link` if path changes
    const handleRouteChange = () => {
      const newLinks = window.location.pathname.split("/");
      dispatch(changeLink(newLinks[newLinks.length - 1]));
    };

    // You might want to add a listener if this needs to update dynamically
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [click, isClick]);
  return (
    <Sidebar collapsible="icon" className=" z-100">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="pb-4 ">
            <SidebarMenuButton
              className="hover:bg-sidebar-accent-foreground hover:text-black"
              asChild
            >
              <div>
                <SidebarTrigger className="" />
                <a href="#">
                  <span className=" font-bold text-2xl text-center w-full">
                    Bed Donation
                  </span>
                </a>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item: any) => (
                <SidebarMenuItem
                  key={item.title}
                  onClick={() => {
                    clearStaffId();
                    clearUpdate();
                    setClick(item.url);
                    setIsClick(!isClick);
                    
                  }}
                  className={
                    item.url === link
                      ? " bg-sidebar-primary text-white rounded-lg"
                      : ""
                  }
                >
                  <SidebarMenuButton size="lg" asChild>
                    <Link href={"/" + rol + "/" + item.url}>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg  ">
                        <item.icon className="size-5" />
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className=" h-fit hover:bg-sidebar-accent-foreground hover:text-black">
                  <div className="flex justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                    <Avatar>
                      <AvatarImage src={userDetails?.photo} />
                      <AvatarFallback className="bg-sidebar-accent font-bold text-white">
                        {userDetails?.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>{" "}
                  </div>
                  {userDetails?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
