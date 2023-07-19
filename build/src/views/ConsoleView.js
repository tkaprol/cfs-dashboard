import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ConsoleComponent from './console/ConsoleComponent';

function ConsoleView(){

    return (
        <MainLayout menu="20">
            <ConsoleComponent/>
        </MainLayout>
    )
}

export default ConsoleView;