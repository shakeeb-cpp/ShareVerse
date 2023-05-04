import React from 'react'
import NavigationCard from './NavigationCard'
import RightNavigation from './RightNavigation';

const Layout = ({ children, hideNavigation }) => {

    let rightColumnClasses = '';
    if (hideNavigation) {
        rightColumnClasses += 'w-full';
    } else {
        rightColumnClasses += 'md:mr-[2px] md:mx-2 md:ml-[-45px] md:w-[78%] w-full p-0 mt-0 bg-[#000] text-white h-screen';
        // md:mr-[2px] md:mx-2 md:ml-[88px]
    }
    return (
        <div className="md:flex md:mt-[0px] md:max-w-full w-full mx-auto mt-[88px] ">
            {!hideNavigation && (
                <div className="md:w-1/3">
                    <NavigationCard />
                </div>
            )}

            <div className={rightColumnClasses}>
                {children}
            </div>

            {!hideNavigation && (
                <div className="md:w-[32%]">
                    <RightNavigation />
                </div>
            )}
        </div>
    )
}

export default Layout
