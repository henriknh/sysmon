from setuptools import setup

setup(
    name='sysmon',
    version='1.0',
    author='Henrik Nilsson Harnert',
    author_email='henrik.nilsson.harnert@gmail.com',
    url='http://henriknh.se/',
    '''license='LICENSE.txt',
    description='Useful towel-related stuff.',
    long_description=open('README.txt').read(),'''
    packages=['sysmon'],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'Flask',
    ],
)